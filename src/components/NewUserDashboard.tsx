import { useState, useRef, useEffect } from "react";
import { Clock, ShieldCheck, LogOut, ScrollText, Check } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

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

export default function NewUserDashboard() {
  const { user, logout, acceptCodeOfConduct } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const showCoCModal = user && !user.cocAccepted;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = el.scrollHeight - el.clientHeight - 10;
      if (el.scrollTop >= threshold) {
        setScrolledToBottom(true);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [showCoCModal]);

  const handleAccept = async () => {
    if (!scrolledToBottom) return;
    setAccepting(true);
    try {
      await acceptCodeOfConduct();
    } catch {
      setAccepting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* CoC Acceptance Modal */}
      {showCoCModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-navy-900 text-white shrink-0">
              <ScrollText className="w-5 h-5" />
              <h2 className="text-lg font-bold">Code of Conduct</h2>
            </div>

            {/* Scrollable body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-3 text-sm text-gray-700 leading-relaxed"
            >
              {codeOfConductContent.split("\n").map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <br key={i} />;

                const isMainHeading = /^\d+\.\s+[A-Z]/.test(trimmed) && !trimmed.startsWith("0.");
                const isSubHeading = /^\d+\.\d+\s/.test(trimmed);
                const isBullet = trimmed.startsWith("- ") || /^[a-f]\.\s/.test(trimmed);
                const isAckLine = trimmed.includes("_______________________");

                if (trimmed === "CODE OF CONDUCT AND WORKPLACE POLICY") {
                  return <p key={i} className="text-lg font-bold text-navy-900 text-center">{trimmed}</p>;
                }
                if (isMainHeading) {
                  return <p key={i} className="text-base font-bold text-navy-900 mt-4 mb-1">{trimmed}</p>;
                }
                if (isSubHeading) {
                  return <p key={i} className="text-sm font-semibold text-navy-800 mt-3 mb-1">{trimmed}</p>;
                }
                if (isBullet) {
                  return <p key={i} className="ml-4">{trimmed}</p>;
                }
                if (isAckLine) {
                  return <p key={i} className="mt-2 font-medium">{trimmed}</p>;
                }
                return <p key={i}>{trimmed}</p>;
              })}
            </div>

            {/* Footer with accept button */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <p className="text-xs text-gray-400">
                {scrolledToBottom
                  ? "You have read the entire Code of Conduct."
                  : "Please scroll to the bottom to acknowledge."}
              </p>
              <button
                onClick={handleAccept}
                disabled={!scrolledToBottom || accepting}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  scrolledToBottom
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {accepting ? (
                  "Processing..."
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    I Acknowledge
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Original welcome content */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.name ?? "User"}!
              </h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                Your account has been created successfully. A Super Admin will review
                your account and assign you a role shortly.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Role Pending Assignment
            </div>

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                What happens next?
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  The Super Admin has been notified about your registration.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Once a role is assigned, you'll gain access to the relevant modules.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  You can log out and check back later, or stay on this page.
                </li>
              </ul>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            If you believe this is taking too long, please contact your administrator.
          </p>
        </div>
      </div>
    </>
  );
}
