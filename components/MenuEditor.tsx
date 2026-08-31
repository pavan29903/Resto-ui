"use client";

import DishPhotoCell from "@/components/DishPhotoCell";
import { symbolFor, type DishPhoto, type Menu } from "@/lib/types";

/** The editable menu table, shared by the first-time review and later edits.
 *  One component so a correction works identically in both places. */
export default function MenuEditor({
  menu,
  onChange,
  restaurantId,
  photos,
  onPhotoChange,
}: {
  menu: Menu;
  onChange: (next: Menu) => void;
  /** Present only when editing a saved menu — a fresh upload has no dish ids
   *  yet, so there is nothing to attach a photo to. */
  restaurantId?: string;
  photos?: Record<string, DishPhoto>;
  onPhotoChange?: (key: string, photo: DishPhoto) => void;
}) {
  const symbol = symbolFor(menu.currency);

  function edit(si: number, ii: number | null, field: string, value: unknown) {
    const next: Menu = structuredClone(menu);
    if (ii === null) (next.sections[si] as Record<string, unknown>)[field] = value;
    else (next.sections[si].items[ii] as Record<string, unknown>)[field] = value;
    onChange(next);
  }

  function removeItem(si: number, ii: number) {
    const next: Menu = structuredClone(menu);
    next.sections[si].items.splice(ii, 1);
    onChange(next);
  }

  function addItem(si: number) {
    const next: Menu = structuredClone(menu);
    next.sections[si].items.push({
      name: "",
      description: "",
      price: null,
      is_vegetarian: null,
      spice_level: null,
    });
    onChange(next);
  }

  function removeSection(si: number) {
    const next: Menu = structuredClone(menu);
    next.sections.splice(si, 1);
    onChange(next);
  }

  function addSection() {
    const next: Menu = structuredClone(menu);
    next.sections.push({ name: "New section", items: [] });
    onChange(next);
  }

  return (
    <>
      {menu.sections.map((section, si) => (
        <div className="sectionblock" key={si}>
          <div className="sectionblock__head">
            <input
              className="field"
              value={section.name}
              aria-label={`Section ${si + 1} name`}
              onChange={(e) => edit(si, null, "name", e.target.value)}
            />
            <button
              className="iconbtn"
              onClick={() => removeSection(si)}
              aria-label={`Remove section ${section.name}`}
              title="Remove this whole section"
            >
              ✕
            </button>
          </div>

          {section.items.map((item, ii) => (
            <div className={`row${restaurantId ? " row--photo" : ""}`} key={ii}>
              {restaurantId && (
                <DishPhotoCell
                  restaurantId={restaurantId}
                  photo={photos?.[`${si}-${ii}`]}
                  dishName={item.name}
                  onChange={(p) => onPhotoChange?.(`${si}-${ii}`, p)}
                />
              )}
              <input
                className="field"
                value={item.name}
                placeholder="Dish name"
                aria-label="Dish name"
                onChange={(e) => edit(si, ii, "name", e.target.value)}
              />
              <input
                className="field"
                value={item.description}
                placeholder="Description (optional)"
                aria-label="Description"
                onChange={(e) => edit(si, ii, "description", e.target.value)}
              />
              <input
                className="field num row__price"
                type="number"
                step="0.01"
                value={item.price ?? ""}
                placeholder={symbol}
                aria-label="Price"
                onChange={(e) =>
                  edit(si, ii, "price", e.target.value === "" ? null : parseFloat(e.target.value))
                }
              />
              <select
                className="field"
                value={item.is_vegetarian === null ? "" : item.is_vegetarian ? "1" : "0"}
                aria-label="Vegetarian"
                onChange={(e) =>
                  edit(si, ii, "is_vegetarian", e.target.value === "" ? null : e.target.value === "1")
                }
              >
                <option value="">Not marked</option>
                <option value="1">Veg</option>
                <option value="0">Non-veg</option>
              </select>
              <button
                className="iconbtn"
                onClick={() => removeItem(si, ii)}
                aria-label={`Remove ${item.name || "dish"}`}
                title="Remove dish"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="sectionblock__foot">
            <button className="linkbtn" onClick={() => addItem(si)}>
              + Add a dish
            </button>
          </div>
        </div>
      ))}

      <button
        className="btn btn--quiet btn--sm"
        style={{ marginBlockStart: "0.85rem" }}
        onClick={addSection}
      >
        + Add a section
      </button>
    </>
  );
}
