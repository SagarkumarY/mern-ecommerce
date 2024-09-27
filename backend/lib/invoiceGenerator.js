import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';


import { fileURLToPath } from 'url'; // Import the fileURLToPath function from the 'url' module
// Get the __filename and __dirname equivalents in ES modules
const __filename = fileURLToPath(import.meta.url); // Convert the file URL to a file path
const __dirname = path.dirname(__filename); // Get the directory name




// Function to generate an invoice PDF
const generateInvoice = (name, email, items) => {
  return new Promise((resolve, reject) => {
    // Define the directory path where invoices will be stored
    const invoicesDir = path.join(__dirname, 'invoices');

    // Check if the 'invoices' directory exists, create it if it doesn't
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true }); // Create directory if it doesn't exist
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Define the file path where the PDF invoice will be saved
    const filePath = path.join(invoicesDir, `${name}-invoice.pdf`);

    // Create a write stream to save the PDF file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Header: Add Invoice title and company information
    doc
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown();

    // Company information
    doc
      .fontSize(10)
      .text('Your Company Name', { align: 'right' })
      .text('123 Company Address', { align: 'right' })
      .text('City, State, ZIP', { align: 'right' })
      .text('Phone: (123) 456-7890', { align: 'right' })
      .text('Email: yourcompany@example.com', { align: 'right' })
      .moveDown(2); // Extra space after company information

    // Add customer information
    doc
      .fontSize(12)
      .text(`Bill to: ${name}`, { underline: true }) // Underlined customer name for emphasis
      .text(`Email: ${email}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown(2); // Extra space after customer information

    // Add a line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Draw a horizontal line

    // Table header for items/services
    const headerYPosition = doc.y + 10; // Starting Y position for the headers

    doc
      .fontSize(12)
      .text('Description', 50, headerYPosition) // Position for Description
      .text('Quantity', 300, headerYPosition) // Position for Quantity
      .text('Unit Price', 370, headerYPosition) // Position for Unit Price
      .text('Total Price', 450, headerYPosition); // Position for Total Price


    // Add a line separator after the table header
    doc.moveTo(50, headerYPosition + 20).lineTo(550, headerYPosition + 20).stroke(); // Line after the header

    // Add items/services to the table
    let yPosition = headerYPosition + 30; // Start positioning items below the header

    let totalPrice = 0;

    items.forEach(item => {
      const price = item.price || 0; // Default to 0 if price is undefined
      const quantity = item.quantity || 0; // Default to 0 if quantity is undefined
      const itemTotal = quantity * price; // Calculate item total price

      totalPrice += itemTotal; // Add to total invoice price

      // Write each item's details into the PDF
      doc
        .fontSize(10)
        .text(item.description?.slice(0, 30), 50, yPosition) // Item description
        .text(quantity, 300, yPosition) // Item quantity
        .text(price.toFixed(2), 370, yPosition) // Unit price
        .text(itemTotal.toFixed(2), 450, yPosition); // Total price for the item

      yPosition += 25; // Increase vertical position for the next item
    });

    // Add a line separator before total
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

    // Display total price
    const total = totalPrice ? totalPrice.toFixed(2) : '0.00';
    doc
      .fontSize(12)
      .text(`Total: $${total}`, 450, yPosition + 20, { align: 'right' }); // Right-align total price

    // Footer with terms and conditions
    doc
      .moveDown(2)
      .fontSize(10)
      .text('Thank you for your business!', { align: 'center' }) // Centered footer message
      .moveDown(0.5)
      .text('Payment is due within 30 days.', { align: 'center' })
      .text('Please make checks payable to Your Company Name.', { align: 'center' });


    // Finalize the PDF and close the document
    doc.end();

    // Handle the 'finish' event when the PDF file writing is completed
    writeStream.on('finish', () => {
      resolve(filePath); // Return the file path when the PDF is successfully written
    });

    // Handle errors during PDF generation
    writeStream.on('error', (error) => {
      reject(error); // Reject the promise with the error
    });
  });
};

// module.exports = generateInvoice;
export default generateInvoice
