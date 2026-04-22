# Section 2.4 — File Upload Integration

## Goal
Integrate cloud storage (Supabase Storage) for receipt uploads, lease document uploads, and maintenance request attachments.

---

## Task 2.4.1 — Choose and Configure Storage Provider

**What:** Set up Supabase Storage as the file storage backend.

**Steps:**
1. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Create `src/lib/supabase.ts`:
   ```ts
   import { createClient } from "@supabase/supabase-js";

   export const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_ANON_KEY!,
   );
   ```
3. Create `.env.local` entries:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_BUCKET=property-pi-files
   ```
4. Set up Supabase project:
   - Create new project at supabase.com (free tier is sufficient)
   - Create storage bucket: `property-pi-files`
   - Set bucket to **public** (so files are accessible via URL)
   - Set up storage policies (see 2.4.5)
5. Create storage folder structure:
   ```
   property-pi-files/
   ├── receipts/          # Expense receipts
   │   └── {unitId}/      # Organized by unit
   │       └── {timestamp}-{filename}
   ├── leases/            # Lease documents (Phase 3)
   │   └── {leaseId}/
   │       └── {filename}
   └── maintenance/       # Maintenance photos (future)
       └── {requestId}/
           └── {filename}
   ```

**Acceptance Criteria:**
- Supabase project created and configured
- `@supabase/supabase-js` installed
- `src/lib/supabase.ts` exports configured client
- `.env.local` has SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET
- Storage bucket `property-pi-files` created in Supabase dashboard
- Bucket is set to public
- Folder structure created in Supabase dashboard

---

## Task 2.4.2 — Create File Upload Utility

**What:** Build a reusable upload function with validation, progress tracking, and error handling.

**Steps:**
1. Create `src/lib/upload.ts`:
   ```ts
   import { supabase } from "./supabase";

   export interface UploadResult {
     url: string;
     path: string;
     fileName: string;
   }

   export interface UploadOptions {
     maxFileSize?: number;       // default: 5MB
     allowedTypes?: string[];    // default: ['image/jpeg', 'image/png', 'application/pdf']
     folder?: string;            // default: 'receipts'
   }

   export async function uploadFile(
     file: File,
     options: UploadOptions = {},
   ): Promise<UploadResult> {
     const {
       maxFileSize = 5 * 1024 * 1024,    // 5MB
       allowedTypes = [
         "image/jpeg",
         "image/png",
         "image/webp",
         "application/pdf",
       ],
       folder = "receipts",
     } = options;

     // Validate file size
     if (file.size > maxFileSize) {
       throw new Error(`File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
     }

     // Validate file type
     if (!allowedTypes.includes(file.type)) {
       throw new Error(`File type not allowed. Allowed: ${allowedTypes.join(", ")}`);
     }

     // Generate unique file path
     const timestamp = Date.now();
     const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
     const path = `${folder}/${timestamp}-${safeName}`;

     // Upload to Supabase
     const { data, error } = await supabase.storage
       .from(process.env.SUPABASE_BUCKET!)
       .upload(path, file, {
         cacheControl: "3600",
         upsert: false,
       });

     if (error) {
       throw new Error(`Upload failed: ${error.message}`);
     }

     // Get public URL
     const { data: urlData } = supabase.storage
       .from(process.env.SUPABASE_BUCKET!)
       .getPublicPath(path);

     return {
       url: urlData.publicUrl,
       path: data.path,
       fileName: file.name,
     };
   }

   export async function deleteFile(path: string): Promise<void> {
     const { error } = await supabase.storage
       .from(process.env.SUPABASE_BUCKET!)
       .remove([path]);

     if (error) {
       throw new Error(`Delete failed: ${error.message}`);
     }
   }
   ```
2. Export utilities from `src/lib/upload.ts`
3. Add upload progress type for future use:
   ```ts
   export interface UploadProgress {
     loaded: number;
     total: number;
     percentage: number;
   }
   ```

**Acceptance Criteria:**
- `uploadFile()` validates file size (default 5MB)
- `uploadFile()` validates file type (image/jpeg, png, webp, pdf)
- `uploadFile()` generates unique file paths with timestamp
- `uploadFile()` uploads to correct Supabase bucket and folder
- `uploadFile()` returns public URL, path, and original filename
- `deleteFile()` removes file from Supabase storage
- Errors are thrown with descriptive messages
- `npm run lint` passes

---

## Task 2.4.3 — Integrate Upload into Expense Form

**What:** Connect the receipt upload field in the expense form to the Supabase upload utility.

**Steps:**
1. Update `src/components/expenses/expense-form.tsx`:
   - Add file upload state:
     ```ts
     const [selectedFile, setSelectedFile] = useState<File | null>(null);
     const [previewUrl, setPreviewUrl] = useState<string | null>(null);
     const [uploading, setUploading] = useState(false);
     const [uploadError, setUploadError] = useState<string | null>(null);
     ```
   - Handle file selection:
     ```ts
     function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
       const file = e.target.files?.[0];
       if (!file) return;
       setSelectedFile(file);
       setUploadError(null);

       // Create preview for images
       if (file.type.startsWith("image/")) {
         const reader = new FileReader();
         reader.onloadend = () => setPreviewUrl(reader.result as string);
         reader.readAsDataURL(file);
       } else {
         setPreviewUrl(null);
       }
     }
     ```
   - Handle form submit:
     ```ts
     async function onSubmit(values: z.infer<typeof expenseSchema>) {
       setUploading(true);
       setUploadError(null);

       let receiptUrl: string | undefined;

       if (selectedFile) {
         try {
           const result = await uploadFile(selectedFile, { folder: "receipts" });
           receiptUrl = result.url;
         } catch (err) {
           setUploadError(err instanceof Error ? err.message : "Upload failed");
           setUploading(false);
           return;
         }
       }

       // Call API with receiptUrl
       const response = await fetch("/api/expenses", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...values, receiptUrl }),
       });

       if (!response.ok) {
         const data = await response.json();
         setUploadError(data.error || "Failed to create expense");
         setUploading(false);
         return;
       }

       // Redirect on success
       router.push("/expenses");
     }
     ```
   - Render file upload UI:
     ```tsx
     <div>
       <label>Receipt (optional)</label>
       <input
         type="file"
         accept="image/*,application/pdf"
         onChange={handleFileChange}
         disabled={uploading}
       />
       {selectedFile && (
         <div className="mt-2">
           {previewUrl ? (
             <img src={previewUrl} alt="Receipt preview" className="max-h-32 rounded" />
           ) : (
             <p className="text-sm text-muted-foreground">📄 {selectedFile.name}</p>
           )}
           <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
         </div>
       )}
       {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
     </div>
     ```
   - Add file size formatter:
     ```ts
     function formatFileSize(bytes: number): string {
       if (bytes < 1024) return `${bytes} B`;
       if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
       return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
     }
     ```

**Acceptance Criteria:**
- File input accepts images and PDFs
- Image files show preview thumbnail after selection
- PDF files show file name with document icon
- File size displayed below selection
- Upload happens before API call (sequential)
- Upload errors shown inline below file input
- Loading state disables form during upload
- Successful upload passes URL to API
- File is stored in Supabase bucket under `receipts/`
- `npm run lint` passes

---

## Task 2.4.4 — Integrate Upload into Lease Form (Phase 3 Prep)

**What:** Add document upload support to the lease creation form for future lease PDF uploads.

**Steps:**
1. Update `src/components/leases/lease-form.tsx`:
   - Add document upload section (currently disabled/placeholder):
     ```tsx
     <div className="opacity-50 pointer-events-none" title="Available in Phase 3">
       <label>Lease Documents (Phase 3)</label>
       <input type="file" accept="application/pdf" disabled />
       <p className="text-xs text-muted-foreground">Lease document upload coming soon</p>
     </div>
     ```
2. Create `src/lib/upload-lease.ts` (placeholder for Phase 3):
   ```ts
   import { uploadFile } from "./upload";

   export async function uploadLeaseDocument(file: File, leaseId: string) {
     return uploadFile(file, {
       folder: `leases/${leaseId}`,
       allowedTypes: ["application/pdf"],
     });
   }
   ```

**Acceptance Criteria:**
- Lease form has placeholder for document upload
- Placeholder is clearly marked as "Phase 3"
- Code structure ready for Phase 3 integration
- No functional changes to lease creation (upload is disabled)

---

## Task 2.4.5 — Set Up Storage Security Policies

**What:** Configure Supabase Storage policies to restrict access to authenticated users only.

**Steps:**
1. In Supabase Dashboard → Storage → Policies, create policies for `property-pi-files` bucket:

   **Policy 1: Authenticated users can upload**
   ```sql
   CREATE POLICY "Authenticated users can upload files"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'property-pi-files');
   ```

   **Policy 2: Authenticated users can read (public bucket, but auth required for management)**
   ```sql
   CREATE POLICY "Authenticated users can view files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'property-pi-files');
   ```

   **Policy 3: Authenticated users can update their own files**
   ```sql
   CREATE POLICY "Authenticated users can update files"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'property-pi-files')
   WITH CHECK (bucket_id = 'property-pi-files');
   ```

   **Policy 4: Authenticated users can delete their own files**
   ```sql
   CREATE POLICY "Authenticated users can delete files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'property-pi-files');
   ```

2. Document the policies in `docs/storage-policies.md`
3. Add a note in `.env.local`:
   ```env
   # Storage policies are configured in Supabase Dashboard.
   # Bucket: property-pi-files (public)
   # Policies: authenticated users can CRUD their files
   ```

**Acceptance Criteria:**
- All 4 policies created in Supabase dashboard
- Authenticated users can upload files
- Authenticated users can read files
- Authenticated users can update files
- Authenticated users can delete files
- Unauthenticated users cannot access storage (even though bucket is public, anon users are blocked by policies)
- Policies are documented

---

## Task 2.4.6 — Create Receipt Viewer Component

**What:** Reusable component for displaying receipts (images and PDFs) in expense detail views.

**Steps:**
1. Create `src/components/expenses/receipt-viewer.tsx`:
   ```tsx
   "use client";

   interface ReceiptViewerProps {
     url: string;
     fileName?: string;
     className?: string;
   }

   export function ReceiptViewer({ url, fileName, className = "" }: ReceiptViewerProps) {
     const isImage = url.match(/\.(jpg|jpeg|png|webp)$/i);
     const isPdf = url.endsWith(".pdf");

     if (isImage) {
       return (
         <div className={className}>
           <Image
             src={url}
             alt={fileName || "Receipt"}
             width={800}
             height={600}
             className="rounded-lg border max-h-96 object-contain"
           />
           <a
             href={url}
             download={fileName}
             className="mt-2 text-sm text-blue-600 hover:underline"
           >
             Download original
           </a>
         </div>
       );
     }

     if (isPdf) {
       return (
         <div className={className}>
           <iframe
             src={url}
             className="w-full h-96 rounded-lg border"
             title="Receipt PDF"
           />
           <a
             href={url}
             download={fileName}
             className="mt-2 text-sm text-blue-600 hover:underline"
           >
             Download PDF
           </a>
         </div>
       );
     }

     // Fallback: link to file
     return (
       <a href={url} className={`text-blue-600 hover:underline ${className}`} target="_blank">
         📎 {fileName || "View file"}
       </a>
     );
   }
   ```
2. Update `src/app/(dashboard)/expenses/[id]/page.tsx` to use the component:
   ```tsx
   import { ReceiptViewer } from "@/components/expenses/receipt-viewer";

   // In the expense detail card:
   {expense.receiptUrl && (
     <div>
       <h3>Receipt</h3>
       <ReceiptViewer
         url={expense.receiptUrl}
         fileName={expense.receiptFileName}
       />
     </div>
   )}
   ```

**Acceptance Criteria:**
- Image receipts render as `<Image>` with proper sizing
- PDF receipts render in `<iframe>` embed
- Fallback shows clickable link for other file types
- Download button available for all file types
- Receipt viewer is used in expense detail page
- `npm run lint` passes
- Images are optimized (Next.js `<Image>` component)

---

## Summary Checklist

- [ ] Task 2.4.1 — Supabase project, bucket, and client configured
- [ ] Task 2.4.2 — Upload utility with validation, error handling
- [ ] Task 2.4.3 — Receipt upload integrated into expense form
- [ ] Task 2.4.4 — Lease document upload placeholder (Phase 3 prep)
- [ ] Task 2.4.5 — Storage security policies configured
- [ ] Task 2.4.6 — Receipt viewer component for images and PDFs

---

## Environment Variables Required

```env
# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=property-pi-files
```

## File Structure After Implementation

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── upload.ts            # Upload utility (uploadFile, deleteFile)
├── components/
│   ├── expenses/
│   │   └── receipt-viewer.tsx   # Image/PDF receipt display
│   └── leases/
│       └── upload-lease.ts      # Placeholder for Phase 3
```

## Supabase Storage Structure

```
property-pi-files/
├── receipts/
│   └── {unitId}/
│       └── {timestamp}-{filename}
├── leases/                  # Phase 3
│   └── {leaseId}/
│       └── {filename}
└── maintenance/             # Future
    └── {requestId}/
        └── {filename}
```
