/**
 * A single soft, static ambient light blob tucked in the upper-right corner.
 * Pure decoration, kept out of the accessibility tree.
 */
export function AmbientLighting() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-[#3B82F6] opacity-[0.045] blur-[130px]" />
    </div>
  );
}
