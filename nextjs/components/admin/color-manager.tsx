"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createColorAction, deleteColorAction, updateColorAction } from "@/lib/actions/admin/colors";

type Color = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  hex_value: string;
  is_active: boolean;
  sort_order: number;
};

function ColorForm({ color, onDone }: { color?: Color; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState(color?.image_url ?? null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setSelectedFileName(file.name);
  }

  function save(formData: FormData) {
    startTransition(async () => {
      const result = color
        ? await updateColorAction(color.id, formData)
        : await createColorAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <form action={save} className="grid gap-3 border border-surface-dim bg-surface-low p-4 sm:grid-cols-2">
      <label className="text-sm">Color name
        <input name="name" defaultValue={color?.name} required className="mt-1 block w-full bg-surface-lowest px-3 py-2" />
      </label>
      <label className="text-sm">URL slug
        <input name="slug" defaultValue={color?.slug} placeholder="Generated from name" className="mt-1 block w-full bg-surface-lowest px-3 py-2" />
      </label>
      <label className="text-sm">Fallback swatch
        <input type="color" name="hex_value" defaultValue={color?.hex_value ?? "#777777"} className="mt-1 block h-10 w-full bg-surface-lowest p-1" />
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <label htmlFor={`colorImage-${color?.id ?? "new"}`} className="text-sm">Card image</label>
        {imagePreview ? (
          <div className="overflow-hidden border border-surface-dim bg-surface-low">
            <div className="relative h-56 bg-black/5">
              <Image src={imagePreview} alt="Color card image preview" fill unoptimized className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-surface-dim px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{selectedFileName ?? "Current color image"}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">Ready to upload when you save</p>
              </div>
              <label htmlFor={`colorImage-${color?.id ?? "new"}`} className="shrink-0 cursor-pointer text-[10px] font-semibold uppercase tracking-label text-foreground underline underline-offset-4">Change</label>
            </div>
          </div>
        ) : (
          <label
            htmlFor={`colorImage-${color?.id ?? "new"}`}
            className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-surface-dim bg-surface-low px-6 py-10 text-center transition-colors hover:border-foreground hover:bg-surface-container"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-xl text-foreground transition-transform group-hover:scale-105">↑</span>
            <span className="mt-4 text-sm font-semibold text-foreground">Upload color card image</span>
            <span className="mt-1 text-xs text-on-surface-variant">Click to browse from your device</span>
            <span className="mt-3 text-[10px] uppercase tracking-label text-on-surface-variant">JPG, PNG, WEBP · max 5 MB</span>
          </label>
        )}
        <input
          ref={imageInputRef}
          id={`colorImage-${color?.id ?? "new"}`}
          type="file"
          name="image"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageChange}
          className="hidden"
        />
        {color?.image_url && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="remove_image" /> Remove current card image
          </label>
        )}
      </div>
      <label className="text-sm">Display order
        <input type="number" name="sort_order" min="0" defaultValue={color?.sort_order ?? 0} className="mt-1 block w-full bg-surface-lowest px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={color?.is_active ?? true} /> Show on homepage and filters
      </label>
      {error && <p className="text-sm text-error sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
          {pending ? "Saving..." : "Save color"}
        </button>
        <button type="button" onClick={onDone} className="bg-surface-container px-4 py-2 text-sm">Cancel</button>
      </div>
    </form>
  );
}

export function ColorManager({ colors }: { colors: Color[] }) {
  const [editing, setEditing] = useState<Color | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function remove(id: number) {
    if (!confirm("Remove this color?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteColorAction(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <ColorForm onDone={() => setEditing(null)} />
      ) : (
        <button type="button" onClick={() => setEditing("new")} className="bg-primary px-4 py-2 text-sm text-primary-foreground">Add color</button>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="divide-y divide-surface-dim border-y border-surface-dim">
        {colors.map((color) => editing !== "new" && editing?.id === color.id ? (
          <ColorForm key={color.id} color={color} onDone={() => setEditing(null)} />
        ) : (
          <div key={color.id} className="grid grid-cols-[56px_1fr_auto] items-center gap-4 py-3 sm:grid-cols-[64px_1fr_120px_140px_auto]">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden" style={{ backgroundColor: color.hex_value }}>
              {color.image_url && <Image src={color.image_url} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-medium">{color.name}</p>
              <p className="truncate text-xs text-secondary">{color.slug}</p>
            </div>
            <p className="hidden text-sm text-secondary sm:block">Order {color.sort_order}</p>
            <p className="hidden text-sm text-secondary sm:block">{color.is_active ? "Visible" : "Hidden"}</p>
            <div className="flex gap-3 text-sm">
              <button type="button" onClick={() => setEditing(color)} className="underline underline-offset-2">Edit</button>
              <button type="button" disabled={pending} onClick={() => remove(color.id)} className="text-error underline underline-offset-2 disabled:opacity-50">Remove</button>
            </div>
          </div>
        ))}
        {colors.length === 0 && <p className="py-6 text-sm text-secondary">No colors have been added.</p>}
      </div>
    </div>
  );
}
