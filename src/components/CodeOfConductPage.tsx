import { useRef, useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";

const codeOfConductContent = `CODE OF CONDUCT AND WORKPLACE POLICY

1. INTRODUCTION
This Code of Conduct sets out the standards of behaviour, ethics, professionalism, and workplace expectations applicable to all employees of FOLAT INVESTMENT LIMITED. Every employee is required to conduct themselves in a manner that promotes integrity, professionalism, mutual respect, accountability, and the protection of FOLAT INVESTMENT LIMITED's reputation, assets, customers, and business interests.
Failure to comply with this Code may result in disciplinary action, including verbal warning, written warning, suspension, termination of employment, and where applicable, referral to law enforcement agencies.

2. PROFESSIONAL CONDUCT
Every employee shall:
a. Conduct himself/herself honestly, professionally, and ethically at all times.
b. Treat customers, colleagues, management, vendors, and members of the public with courtesy, respect, and dignity.
c. Carry out assigned duties diligently and efficiently.
d. Comply with all lawful instructions issued by supervisors and management.
e. Promote and protect the reputation, goodwill, and interests of FOLAT INVESTMENT LIMITED.
f. Avoid any conduct capable of bringing FOLAT INVESTMENT LIMITED into disrepute.

3. WORKPLACE BEHAVIOUR
The following conduct is strictly prohibited:

3.1 Violence and Disorderly Conduct
Employees shall not engage in:
- Fighting or physical assault
- Threatening behaviour
- Intimidation
- Horseplay or reckless conduct
- Abusive, insulting, offensive, or discriminatory language

3.2 Harassment and Bullying
FOLAT INVESTMENT LIMITED maintains a zero-tolerance policy towards:
- Sexual harassment
- Workplace bullying
- Verbal abuse
- Emotional or psychological intimidation
- Any form of discrimination based on gender, religion, ethnicity, disability, or other protected status

Any employee found guilty of harassment may be subject to disciplinary action up to and including dismissal.

3.3 Substance Abuse
Employees shall not:
- Report to work under the influence of alcohol or drugs
- Consume intoxicating substances during working hours
- Possess, distribute, or use illegal drugs within FOLAT INVESTMENT LIMITED premises

FOLAT INVESTMENT LIMITED reserves the right to require an employee reasonably suspected of impairment to undergo appropriate testing in accordance with applicable laws.

4. INTEGRITY AND ETHICAL STANDARDS

4.1 Fraud and Dishonesty
Employees shall not engage in:
- Fraud
- Forgery
- Misappropriation of funds
- Bribery
- Corruption
- False claims or representations
- Unauthorized financial transactions

Any employee found engaging in fraudulent activities shall be subject to disciplinary measures and possible criminal prosecution.

4.2 Theft and Misappropriation
The theft, attempted theft, or unauthorized removal of FOLAT INVESTMENT LIMITED property, customer property, or property belonging to fellow employees is strictly prohibited.

4.3 Conflict of Interest
Employees shall avoid situations where personal interests conflict with the interests of FOLAT INVESTMENT LIMITED. Employees must disclose any actual or potential conflict of interest to Management immediately.

5. ATTENDANCE, PUNCTUALITY AND LEAVE

5.1 Attendance
Employees are expected to report to work regularly and punctually. Habitual lateness, absenteeism, or abandonment of duty may result in disciplinary action.

5.2 Absence from Work
Except in emergencies, requests for leave or absence shall be submitted in writing and approved by Management before commencement. Employees shall provide reasonable notice whenever practicable.

5.3 Medical Absence
Where absence is due to illness exceeding two (2) consecutive working days, the employee may be required to submit a medical report or fitness certificate from a licensed medical practitioner. FOLAT INVESTMENT LIMITED reserves the right to verify the authenticity of any medical documentation provided.

6. PERFORMANCE AND CONFIRMATION OF EMPLOYMENT
Employees shall be assessed based on:
- Job performance
- Professional conduct
- Attendance and punctuality
- Compliance with FOLAT INVESTMENT LIMITED policies
- Teamwork and attitude towards work

Employees on probation shall undergo performance appraisal before confirmation of appointment. FOLAT INVESTMENT LIMITED reserves the right to extend probation or terminate employment where performance or conduct is unsatisfactory, subject to applicable laws and the employment contract.

7. WORKPLACE CLEANLINESS AND SAFETY
Employees shall:
- Maintain clean and organized workspaces
- Observe workplace health and safety requirements
- Properly use and safeguard FOLAT INVESTMENT LIMITED equipment
- Promptly report hazards, accidents, or unsafe conditions

Deliberate damage to FOLAT INVESTMENT LIMITED property may result in disciplinary action and recovery of repair or replacement costs where legally permissible.

8. USE OF FOLAT INVESTMENT LIMITED PROPERTY
Employees shall:
- Use FOLAT INVESTMENT LIMITED resources solely for authorized business purposes
- Exercise reasonable care in handling FOLAT INVESTMENT LIMITED assets
- Return all FOLAT INVESTMENT LIMITED property upon request or termination of employment

FOLAT INVESTMENT LIMITED property includes: Computers, Mobile devices, Documents, Financial records, Customer information, Identification cards, Equipment and tools.

9. DRESS CODE
Employees shall maintain a professional appearance consistent with FOLAT INVESTMENT LIMITED's image. Management may prescribe specific uniforms or dress requirements. The following attire is prohibited during working hours:
- Torn or excessively distressed clothing
- Offensive or inappropriate clothing
- Revealing attire
- Slippers (except where permitted)
- Clothing that may adversely affect the FOLAT INVESTMENT LIMITED's professional image

10. WORKING HOURS
Unless otherwise determined by Management:
Official Working Hours: Monday - Friday, 8:00 a.m. - 6:00 p.m.
Employees are expected to be at their workstations and ready to commence work at the designated start time. Any overtime work must be approved by Management.

11. CONFIDENTIALITY
Employees shall maintain strict confidentiality regarding:
- Customer information
- Financial records
- Trade secrets
- Business plans
- Operational processes
- Internal reports
- Pricing structures
- Marketing strategies
- Employee information

Employees shall not disclose confidential information during or after employment except where legally required. Breach of confidentiality may result in disciplinary action, civil liability, and/or criminal prosecution.

12. DATA PROTECTION
Employees shall comply with all applicable data protection and privacy laws, including the provisions of the Nigeria Data Protection Act 2023. Employees shall protect customer and employee personal information from unauthorized access, disclosure, loss, or misuse.

13. INTELLECTUAL PROPERTY AND OWNERSHIP
All work products created during the course of employment, including Reports, Databases, Customer records, Training materials, Marketing materials, Software, Business processes, Innovations and improvements, shall belong exclusively to FOLAT INVESTMENT LIMITED unless otherwise agreed in writing.

14. SOCIAL MEDIA POLICY
Employees shall not:
- Publish confidential FOLAT INVESTMENT LIMITED information online
- Make false or defamatory statements about FOLAT INVESTMENT LIMITED
- Represent themselves as speaking on behalf of FOLAT INVESTMENT LIMITED without authorization

Employees must use social media responsibly and in a manner that does not damage the FOLAT INVESTMENT LIMITED's reputation.

15. OUTSIDE EMPLOYMENT
Employees shall not engage in any outside employment, consultancy, business activity, or occupation that:
- Conflicts with their duties to FOLAT INVESTMENT LIMITED
- Competes with FOLAT INVESTMENT LIMITED
- Impairs performance of their responsibilities

Employees must obtain prior written approval from Management before accepting any secondary employment or business engagement.

16. NON-COMPETITION AND NON-SOLICITATION
During employment, employees shall not:
- Engage in competing business activities
- Solicit FOLAT INVESTMENT LIMITED's customers for personal benefit
- Induce employees to leave FOLAT INVESTMENT LIMITED's employment

Any post-employment restrictions shall be limited to the extent permitted by Nigerian law and shall be reasonable in scope, duration, and geographical application.

17. DISCIPLINARY PROCEDURE
Where an employee breaches this Code, FOLAT INVESTMENT LIMITED may apply any of the following disciplinary measures:
- Verbal Warning
- Written Warning
- Final Written Warning
- Suspension
- Termination of Employment
- Summary Dismissal for Gross Misconduct

Before any disciplinary sanction is imposed, the employee shall be afforded a fair opportunity to explain his/her conduct in accordance with the principles of fair hearing.

18. WHISTLEBLOWING
Employees are encouraged to report in good faith any suspected:
- Fraud
- Corruption
- Theft
- Harassment
- Regulatory breaches
- Ethical misconduct

Retaliation against any employee who reports misconduct in good faith is strictly prohibited.

19. ACKNOWLEDGEMENT
I hereby acknowledge that I have read, understood, and agree to comply with this Code of Conduct and Workplace Policy.

Employee Name: _______________________
Signature: ____________________________
Date: ________________________________

Witness/HR Representative: _______________________
Signature: ____________________________
Date: ________________________________`;

function formatContentForDisplay(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    const isMainHeading = /^\d+\.\s+[A-Z]/.test(trimmed) && !trimmed.startsWith("0.");
    const isSubHeading = /^\d+\.\d+\s/.test(trimmed);
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("a. ") || trimmed.startsWith("b. ") || trimmed.startsWith("c. ") || trimmed.startsWith("d. ") || trimmed.startsWith("e. ") || trimmed.startsWith("f. ");
    const isAckLine = trimmed.includes("_______________________");

    if (trimmed === "CODE OF CONDUCT AND WORKPLACE POLICY") {
      return <h1 key={i} className="text-2xl font-bold text-navy-900 text-center mb-6">{trimmed}</h1>;
    }
    if (isMainHeading) {
      return <h2 key={i} className="text-lg font-bold text-navy-900 mt-6 mb-3">{trimmed}</h2>;
    }
    if (isSubHeading) {
      return <h3 key={i} className="text-base font-semibold text-navy-800 mt-4 mb-2">{trimmed}</h3>;
    }
    if (isBullet) {
      return <p key={i} className="text-sm text-gray-700 ml-4 mb-1">{trimmed}</p>;
    }
    if (isAckLine) {
      return <p key={i} className="text-sm text-gray-600 mt-3 font-medium">{trimmed}</p>;
    }

    return <p key={i} className="text-sm text-gray-700 mb-2 leading-relaxed">{trimmed}</p>;
  });
}

export default function CodeOfConductPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const [downloading, setDownloading] = useState(false);

  const getJsPdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).jspdf?.jsPDF) {
        resolve((window as any).jspdf);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve((window as any).jspdf);
      script.onerror = () => reject(new Error("Failed to load PDF library"));
      document.head.appendChild(script);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const jspdf = await getJsPdf();
      const doc = new jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const marginLeft = 12;
      const pageWidth = 186;
      let y = 18;

      const lines = codeOfConductContent.split("\n");

      for (const rawLine of lines) {
        const text = rawLine.trimEnd();
        if (!text) {
          y += 2.5;
          if (y > 282) { doc.addPage(); y = 18; }
          continue;
        }

        const trimmed = text.trim();
        let fontSize = 9;
        let fontStyle: "normal" | "bold" = "normal";

        if (trimmed === "CODE OF CONDUCT AND WORKPLACE POLICY") {
          fontSize = 15;
          fontStyle = "bold";
        } else if (/^\d+\.\s+[A-Z]/.test(trimmed) && !trimmed.startsWith("0.")) {
          fontSize = 12;
          fontStyle = "bold";
        } else if (/^\d+\.\d+\s/.test(trimmed)) {
          fontSize = 10;
          fontStyle = "bold";
        }

        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);

        const indent = trimmed.startsWith("- ") || /^[a-f]\.\s/.test(trimmed) ? 5 : 0;
        const wrapped = doc.splitTextToSize(text, pageWidth - indent);

        for (const wl of wrapped) {
          if (y > 282) { doc.addPage(); y = 18; }
          doc.text(wl, marginLeft + indent, y);
          y += fontSize * 0.42;
        }

        y += 0.8;
      }

      doc.save("FOLAT_Code_of_Conduct.pdf");
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Code of Conduct</h1>
          <p className="text-sm text-gray-500 mt-1">
            FOLAT INVESTMENT LIMITED — Employee Code of Conduct and Workplace Policy
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-navy-900 rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? "Opening..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div
        ref={contentRef}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10"
      >
        {formatContentForDisplay(codeOfConductContent)}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
