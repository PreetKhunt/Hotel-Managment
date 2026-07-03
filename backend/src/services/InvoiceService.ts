import { pgPool } from '../config/database';
import { InvoiceStatus } from '../domain/enums';
import { supabase } from '../config/supabase';
import PDFDocument from 'pdfkit';

export class InvoiceService {
  /**
   * Generates a readable invoice number (e.g., INV-2026-000001)
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString();
    return `INV-${year}-${randomHex}`;
  }

  /**
   * Helper to create PDF Buffer
   */
  private async createInvoicePdfBuffer(
    invoiceNumber: string,
    bookingId: string,
    subtotal: number,
    cgst: number,
    sgst: number,
    igst: number,
    grandTotal: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12)
           .text(`Invoice Number: ${invoiceNumber}`)
           .text(`Date: ${new Date().toLocaleDateString()}`)
           .text(`Booking ID: ${bookingId}`);
        doc.moveDown();
        
        doc.text('--------------------------------------------------');
        doc.moveDown();
        
        doc.text(`Subtotal: INR ${subtotal.toFixed(2)}`);
        doc.text(`CGST: INR ${cgst.toFixed(2)}`);
        doc.text(`SGST: INR ${sgst.toFixed(2)}`);
        if (igst > 0) doc.text(`IGST: INR ${igst.toFixed(2)}`);
        
        doc.moveDown();
        doc.text('--------------------------------------------------');
        doc.fontSize(14).text(`Grand Total: INR ${grandTotal.toFixed(2)}`, { underline: true });
        
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Scaffolds the creation of an invoice.
   * Generates a PDF and uploads it to Supabase Storage.
   */
  public async generateInvoice(
    bookingId: string,
    subtotal: number,
    cgst: number,
    sgst: number,
    igst: number,
    grandTotal: number,
    hotelId?: string
  ) {
    const client = await pgPool.connect();
    try {
      // 1. Check if invoice already exists
      const existingRes = await client.query('SELECT id, invoice_number, invoice_url FROM invoices WHERE booking_id = $1', [bookingId]);
      if (existingRes.rows.length > 0) {
        return {
          invoiceId: existingRes.rows[0].id,
          invoiceNumber: existingRes.rows[0].invoice_number,
          invoiceUrl: existingRes.rows[0].invoice_url
        };
      }

      const invoiceNumber = this.generateInvoiceNumber();
      
      // Generate PDF Buffer
    const pdfBuffer = await this.createInvoicePdfBuffer(invoiceNumber, bookingId, subtotal, cgst, sgst, igst, grandTotal);
    
    const fileName = `${invoiceNumber}.pdf`;
    
    // Upload to Supabase Storage (Assumes 'invoices' bucket exists and is public)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Failed to upload invoice to storage:', uploadError);
      throw new Error('Invoice PDF upload failed');
    }

    const { data: publicUrlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(fileName);

    const invoiceUrl = publicUrlData.publicUrl;

    const query = `
      INSERT INTO invoices (
        hotel_id, booking_id, invoice_number, invoice_url, storage_path, subtotal, 
        cgst_amount, sgst_amount, igst_amount, grand_total, status, paid_at, generated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING id;
    `;
    const values = [
      hotelId || null, bookingId, invoiceNumber, invoiceUrl, uploadData.path, subtotal,
      cgst, sgst, igst, grandTotal, InvoiceStatus.PAID
    ];

    const res = await client.query(query, values);
    return {
      invoiceId: res.rows[0].id,
      invoiceNumber,
      invoiceUrl
    };
  } catch (error) {
    console.error('Failed to insert invoice into DB:', error);
    throw new Error('Invoice generation failed');
  } finally {
    client.release();
  }
}
}

export const invoiceService = new InvoiceService();
