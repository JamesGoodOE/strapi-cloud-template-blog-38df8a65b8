/* global Word */
import { ReportCitation } from "../services/types";

/**
 * Format an Oxford Economics citation in a consistent house style:
 *   Oxford Economics, "Report Title", Author, DD Month YYYY, locator.
 */
export function formatCitation(citation: ReportCitation): string {
  const parts: string[] = ["Oxford Economics"];
  parts.push(`“${citation.reportTitle}”`);
  if (citation.author && citation.author !== "Oxford Economics") parts.push(citation.author);
  if (citation.publicationDate) parts.push(formatDate(citation.publicationDate));
  if (citation.locator) parts.push(citation.locator);
  return parts.join(", ") + ".";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Insert a quoted passage from an Economic Report at the current selection,
 * styled as a block quotation, followed by an attributed citation line.
 */
export async function insertQuotationWithCitation(citation: ReportCitation): Promise<void> {
  await Word.run(async (context) => {
    const selection = context.document.getSelection();

    // The quotation as an indented block quote.
    const quote = selection.insertParagraph(`“${citation.excerpt.trim()}”`, Word.InsertLocation.after);
    quote.styleBuiltIn = Word.BuiltInStyleName.intenseQuote;

    // The citation line, in a lighter style directly beneath the quote.
    const cite = quote.insertParagraph(formatCitation(citation), Word.InsertLocation.after);
    cite.font.italic = true;
    cite.font.size = 9;
    cite.font.color = "#5A6B7B";

    // Turn the report title into a hyperlink back to the platform, when present.
    if (citation.url) {
      const range = cite.getRange(Word.RangeLocation.whole);
      range.hyperlink = citation.url;
    }

    await context.sync();
  });
}
