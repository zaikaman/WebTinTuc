/**
 * Helpers for safe PostgREST filter construction.
 *
 * PostgREST is parameterized at the SQL layer, so classic SQL injection is not
 * possible through `.or()` / `.ilike()` strings. Values are still parsed as
 * filter expressions, so raw user input can break or broaden filters via
 * reserved characters (`,`, `.`, `(`, `)`, `"`) and LIKE wildcards (`%`, `_`).
 */

/**
 * Escape a user string for use as a PostgREST `ilike` *contains* pattern value.
 *
 * - Escapes LIKE wildcards so `%` / `_` match literally
 * - Always double-quotes the value so commas/parens/dots cannot inject extra
 *   filter clauses inside `.or(...)`
 *
 * @example
 * query.or(`title.ilike.${ilikeContains(search)},slug.ilike.${ilikeContains(search)}`)
 */
export function ilikeContains(raw: string): string {
  const likeEscaped = raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
  // Double-quote; escape embedded " as ""
  return `"%${likeEscaped.replace(/"/g, '""')}%"`
}

/**
 * Build a PostgREST `.or()` expression of `column.ilike.<contains>` clauses.
 */
export function orIlikeContains(columns: string[], raw: string): string {
  const pattern = ilikeContains(raw)
  return columns.map((col) => `${col}.ilike.${pattern}`).join(',')
}
