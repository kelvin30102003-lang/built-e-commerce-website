"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addProductImageAction, deleteProductImageAction } from "@/lib/actions/admin/products";

type ProductImage = { id: number; image_url: string; sort_order: number };

export function ImageManager({ productId, images }: { productId: number; images: ProductImage[] }) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  function handleUpload(formData: FormData) {
    startTransition(async () => {
      const result = await addProductImageAction(productId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setPreview(null);
      formRef.current?.reset();
      router.refresh();
    });
  }

  async function handleDelete(imageId: number) {
    if (!confirm("Delete this image?")) return;
    await deleteProductImageAction(imageId, productId);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Existing images grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-pink-100 bg-slate-50"
            >
              {index === 0 && (
                <span className="absolute left-1 top-1 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Main
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.image_url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-red-500 opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic">No images yet — upload one below.</p>
      )}

      {/* Upload form */}
      <form ref={formRef} action={handleUpload} className="space-y-3">
        {/* Drop zone / file picker */}
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/40 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-pink-400 hover:bg-pink-50"
        >
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="preview" className="h-28 w-28 rounded-lg object-cover shadow" />
          ) : (
            <>
              <span className="text-3xl">🖼️</span>
              <span className="font-medium text-slate-600">Click to choose an image</span>
              <span className="text-xs text-slate-400">PNG, JPG, WEBP — max 5 MB</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            name="image"
            accept="image/*"
            required
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending || !preview}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40 transition-opacity"
        >
          {isPending ? "Uploading…" : "Upload Image"}
        </button>
      </form>
    </div>
  );
}
