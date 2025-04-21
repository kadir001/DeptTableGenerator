let overzicht = [];
let schuld, termijnBedrag;

function genereerTabel() {
  overzicht = [];
  document.getElementById('resultaat').innerHTML = '';

  schuld = parseFloat(document.getElementById('schuldBedrag').value);
  termijnBedrag = parseFloat(document.getElementById('termijnBedrag').value);

  if (isNaN(schuld) || isNaN(termijnBedrag) || schuld <= 0 || termijnBedrag <= 0) {
    alert("Vul correcte bedragen in.");
    return;
  }

  let huidigeDatum = new Date();
  huidigeDatum.setMonth(huidigeDatum.getMonth() + 1);

  let termijn = 0;
  while (schuld > 0) {
    overzicht.push({
      termijn: termijn,
      datum: huidigeDatum.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long' }),
      schuld: schuld.toFixed(2)
    });
    termijn++;
    schuld -= termijnBedrag;
    if (schuld < 0) schuld = 0;
    huidigeDatum.setMonth(huidigeDatum.getMonth() + 1);
  }

  toonTabel();
}

function toonTabel() {
  let html = `
    <table>
      <tr>
        <th>Termijn</th>
        <th>Datum</th>
        <th>Schuld (€)</th>
      </tr>
  `;
  overzicht.forEach(item => {
    html += `
      <tr>
        <td>${item.termijn}</td>
        <td>${item.datum}</td>
        <td>€${item.schuld}</td>
      </tr>
    `;
  });
  html += `</table>
    <button onclick="downloadTXT()">Download als TXT</button>
    <button onclick="downloadPDF()">Download als PDF</button>
  `;

  document.getElementById('resultaat').innerHTML = html;
}

function downloadTXT() {
  let tekst = "Termijn | Datum        | Schuld in euro\n----------------------------------------\n";
  overzicht.forEach(item => {
    tekst += `${item.termijn} | ${item.datum} | €${item.schuld}\n`;
  });

  const blob = new Blob([tekst], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `schuld_aflossing_${new Date().toLocaleDateString('nl-NL')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(14);
  doc.text("Schuld Aflossen Overzicht", 10, 10);

  doc.setFontSize(11);
  let startY = 20;
  doc.text("Termijn", 10, startY);
  doc.text("Datum", 40, startY);
  doc.text("Schuld (€)", 120, startY);
  doc.line(10, startY + 2, 200, startY + 2);

  let y = startY + 10;
  overzicht.forEach(item => {
    doc.text(String(item.termijn), 10, y);
    doc.text(item.datum, 40, y);
    doc.text("€" + item.schuld, 120, y);

    y += 7;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  y += 10;
  let totaalBetaald = overzicht.length * termijnBedrag;
  doc.setFontSize(12);
  doc.text(`Totaal aantal termijnen: ${overzicht.length}`, 10, y);
  y += 7;
  doc.text(`Totaal afgelost bedrag: €${totaalBetaald.toFixed(2)}`, 10, y);

  doc.save(`schuld_aflossing_${new Date().toLocaleDateString('nl-NL')}.pdf`);
}
