export interface TaxDetails {
  taxPercentage: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
}

export class TaxService {
  /**
   * Calculates GST for the booking based on the subtotal.
   * Assumes intra-state (CGST 9% + SGST 9%) by default for standard hotel rules, 
   * but can be expanded for IGST (18%) if out of state logic is added.
   * Rates change based on price slabs (e.g., < 1000 = 0%, 1000-7500 = 12%, > 7500 = 18%).
   * For simplicity and enterprise baseline, we assume 18% standard GST (9% CGST, 9% SGST).
   */
  public calculateTaxes(subtotal: number, isInterState: boolean = false): TaxDetails {
    // Current Indian Hotel GST Slab simplification (assuming luxury > 7500 INR/night equivalent)
    const taxPercentage = 18; 
    
    const totalTax = (subtotal * taxPercentage) / 100;
    
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstAmount = totalTax;
    } else {
      cgstAmount = totalTax / 2;
      sgstAmount = totalTax / 2;
    }

    return {
      taxPercentage,
      cgstAmount: Number(cgstAmount.toFixed(2)),
      sgstAmount: Number(sgstAmount.toFixed(2)),
      igstAmount: Number(igstAmount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal: Number((subtotal + totalTax).toFixed(2)),
    };
  }
}

export const taxService = new TaxService();
