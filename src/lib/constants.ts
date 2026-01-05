export const DPI = 300; // High resolution for print
export const CM_TO_INCH = 0.393701;

// Dimensions in cm
export const MUG_HEIGHT_CM = 9;
export const MUG_WIDTH_CM = 21; // Printable area
export const HANDLE_WIDTH_CM = 4; // Non-printable handle area (for visualization context)
export const TOTAL_CIRCUMFERENCE_CM = 25; // 21 + 4

// Dimensions in pixels (at 300 DPI)
export const CANVAS_WIDTH = Math.round(MUG_WIDTH_CM * CM_TO_INCH * DPI);
export const CANVAS_HEIGHT = Math.round(MUG_HEIGHT_CM * CM_TO_INCH * DPI);

export const HANDLE_WIDTH_PX = Math.round(HANDLE_WIDTH_CM * CM_TO_INCH * DPI);

// Colors
export const HANDLE_COLOR = '#f0f0f0'; // Light gray to represent the handle area in preview
