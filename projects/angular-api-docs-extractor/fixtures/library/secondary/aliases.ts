/** Underlying declaration summary.
 * @public
 * @deprecated Underlying deprecation.
 */
export class AliasTarget {}

/** Alias declaration summary.
 * @deprecated Alias deprecation.
 * @internal
 */
export { AliasTarget as DocumentedAlias };

export { AliasTarget as UndocumentedAlias };

/** Shared export summary.
 * @deprecated Shared deprecation.
 */
export {
  /** Specific alias summary.
   * @deprecated Specific deprecation.
   */
  AliasTarget as SpecificAlias,
  AliasTarget as SharedAlias
};

/** Internal original summary.
 * @internal
 */
export class InternalAliasTarget {}
export { InternalAliasTarget as BareInternalAlias };
