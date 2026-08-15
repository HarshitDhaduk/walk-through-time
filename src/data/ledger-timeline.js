/* THE DOCUMENTED CORRIDOR — the 2014–today walk.
   The same walkway machinery as 1526–1947, fed a second dataset: the
   Republic's Ledger's eighteen matters as eighteen stations. Zones map
   onto the corridor's five eras so every era-keyed system (floor,
   light, architecture, audio) still works — and the arc fits: opening
   promises → the great schemes → the cracks → the scorched midpoint →
   the plaza where the citizens now stand.
   Every station carries a `docs` array: the official record, linked.  */

export const LEDGER_TIMELINE = [
  // ---- Zone I · 2014–2016 · The Mandate ------------------------------
  { id:"agencies-2014", era:"mughal", zone:0, year:"2014–", side:"left", accent:"#B0623A", prop:"cabinet", art:"scales", ledger:"Central Agencies & the Opposition",
    title:"The Agencies & the Opposition",
    summary:"Published data found roughly 95% of Enforcement Directorate cases against politicians since 2014 involved opposition figures — a pattern the government attributes to where offences occurred. Courts granting bail in high-profile cases criticised aspects of the agency’s conduct.",
    details:"“Bail is the rule, jail the exception” — Sisodia, 17 months without trial. Kejriwal: the CBI must “dispel the notion of it being a caged parrot.” Conviction rates in political cases remain low." },
  { id:"rafale-2015", era:"mughal", zone:0, year:"2015–2021", side:"right", accent:"#5B6EA8", prop:"rockets", art:"cannon", ledger:"The Rafale Deal",
    title:"The Rafale Deal",
    summary:"Thirty-six jets replace a 126-jet tender. The CAG audits the price in a partly-redacted 2019 report; the Supreme Court declines a probe (2018) and dismisses review (2019); France opens a judicial investigation (2021).",
    details:"No Indian court or audit body found illegality. The CAG found the package 2.86% cheaper than the aligned 2007 price — and no bank guarantee, unlike 2007." },
  { id:"demonetisation-2016", era:"mughal", zone:0, year:"2016", side:"left", accent:"#E0A458", prop:"queue", art:"coins", ledger:"Demonetisation",
    title:"Demonetisation",
    summary:"On 8 November 2016, 86% of currency by value is withdrawn overnight. The RBI later records 99.3% of the notes returned. A Constitution Bench upholds the decision 4–1 in 2023; Justice Nagarathna dissents.",
    details:"Stated aims: black money, counterfeits, terror finance. The RBI’s own annual report is the document that answered the first." },
  { id:"bankfraud-2016", era:"mughal", zone:0, year:"2016–2022", side:"right", accent:"#9C6B30", prop:"ship", art:"ship", ledger:"Bank Frauds & Fugitive Economic Offenders",
    title:"The Fugitives",
    summary:"Mallya (2016), Nirav Modi and Choksi (2018), then the record ABG Shipyard and DHFL frauds. UK courts approved extradition years ago; as of 2026 neither Mallya nor Nirav Modi has been surrendered. Belgium cleared Choksi’s extradition in 2025.",
    details:"The frauds were by private actors; the accountability question is lender oversight and recovery. The ED reports ₹14,131 crore of Mallya’s assets restituted to banks." },

  // ---- Zone II · 2018–2021 · The Great Schemes ----------------------
  { id:"electoral-bonds-2018", era:"mughal", zone:1, year:"2018–2024", side:"left", accent:"#C9A227", prop:"scrolls", art:"scroll", ledger:"Electoral Bonds",
    title:"Electoral Bonds",
    summary:"Anonymous corporate political donations by bank-issued bond. The RBI and Election Commission objected before launch; the Finance Ministry proceeded. In February 2024 a Constitution Bench struck the scheme down, unanimously, as unconstitutional.",
    details:"The Court ordered SBI to publish every purchase. ₹16,518 crore in bonds; the ruling party received 54.77% of the encashed value." },
  { id:"pmcares-2020", era:"mughal", zone:1, year:"2020–", side:"right", accent:"#F0E6D2", prop:"forward", art:"book", ledger:"PM CARES Fund",
    title:"PM CARES",
    summary:"Chaired by the Prime Minister, carrying state symbols, receiving public-sector money — and maintained in court to be neither a “public authority” under RTI nor subject to CAG audit. A private firm audits it. The dispute is about opacity, not adjudicated misuse.",
    details:"“Not a Government of India fund” — the PMO’s affidavit. The RTI appeal was still pending in the Delhi High Court in 2026." },
  { id:"central-vista-2020", era:"mughal", zone:1, year:"2020–2023", side:"left", accent:"#A67C3D", prop:"scissors", art:"gate", ledger:"Central Vista Redevelopment",
    title:"Central Vista",
    summary:"The rebuild of Delhi’s government district through the pandemic. The Supreme Court cleared it 2–1 in 2021; Justice Khanna dissented on public consultation. Sanctioned cost rose to ₹13,170 crore. Nineteen parties boycotted the 2023 inauguration.",
    details:"Process, timing and cost — matters of debate; no wrongdoing has been adjudicated." },
  { id:"pegasus-2021", era:"mughal", zone:1, year:"2021–2022", side:"right", accent:"#33507A", prop:"podium", art:"khanda", ledger:"Pegasus Surveillance Allegations",
    title:"Pegasus",
    summary:"Journalists, opposition politicians and activists on a list linked to military-grade spyware sold only to governments. The Supreme Court records that the Union made “no specific denial” — and, a year later, that the government “has not cooperated” with its committee.",
    details:"Malware on 5 of 29 phones; Pegasus not conclusively identified. The committee’s reports remain sealed. Parliament’s IT committee meeting collapsed for want of quorum." },

  // ---- Zone III · 2020–2023 · The Cracks -----------------------------
  { id:"covid-2021", era:"transition", zone:2, year:"2020–2022", side:"left", accent:"#6B7280", prop:"bowl", art:"bowl", quiet:true, ledger:"COVID-19 Second Wave",
    title:"The Second Wave",
    summary:"Hospitals and oxygen ran out. Parliament was told no oxygen-shortage deaths were “specifically reported”; its own committee later called the ministry’s assurance “brutally exposed” and asked for an audit. WHO estimated ~4.7 million excess deaths; the government formally disputes the method.",
    details:"This station is kept deliberately spare." },
  { id:"cag-2022", era:"transition", zone:2, year:"2022–2025", side:"right", accent:"#BFA045", prop:"pothole", art:"road", ledger:"What the CAG Found",
    title:"What the CAG Found",
    summary:"Derailment risks flagged before Balasore; Ayushman Bharat claims paid for the dead; Dwarka Expressway at ₹250.77 crore/km against ₹18.2 approved; 94% invalid bank records in a skills scheme. Weeks after the 2023 tablings, the auditing officers were transferred. Reports tabled fell to a record low.",
    details:"“Administrative convenience,” said the CAG. Every finding links to the report." },
  { id:"adani-2023", era:"transition", zone:2, year:"2023–2026", side:"left", accent:"#8C7A66", prop:"throne", art:"throne", ledger:"Adani Group Investigations",
    title:"The Adani Questions",
    summary:"A short-seller’s allegations; a Supreme Court committee finding no regulatory failure “as of now”; SEBI closing proceedings without penalty (2025); a US indictment — and its fraud counts dismissed at the Justice Department’s own request in August 2026, the judge calling the process “concerning.” No court or regulator has found wrongdoing.",
    details:"Every allegation was denied by the group. The remaining US counts against others are unproven." },
  { id:"ec-appointments-2023", era:"transition", zone:2, year:"2023", side:"right", accent:"#5B8AA8", prop:"podium", art:"crownarch", ledger:"Who Appoints the Election Commission",
    title:"Who Picks the Umpire",
    summary:"A Constitution Bench says: until Parliament legislates, the PM, the Leader of Opposition and the Chief Justice choose Election Commissioners. Nine months later Parliament legislates — and replaces the Chief Justice with a minister the PM nominates.",
    details:"A constitutional challenge to the Act is pending." },

  // ---- Zone IV · 2024 · The Scorched Year -----------------------------
  { id:"chandigarh-2024", era:"british", zone:3, year:"2024", side:"left", accent:"#D93A2B", prop:"scissors", art:"fire", ledger:"Chandigarh Mayoral Election",
    title:"Eight Ballots",
    summary:"A presiding officer is filmed defacing ballots. The Supreme Court examines them itself, declares the defrauded candidate the lawful winner, and initiates proceedings against the officer — the Chief Justice calling it, in open court, “a murder of democracy.”",
    details:"All eight ballots held validly cast; result set aside under Article 142." },
  { id:"neet-2024", era:"british", zone:3, year:"2024", side:"right", accent:"#4F6D8C", prop:"forward", art:"book", ledger:"NEET-UG 2024 Paper Leak",
    title:"NEET 2024",
    summary:"A leak traced to Hazaribagh and Patna, ~155 beneficiaries, five CBI chargesheets. The Supreme Court confirms the leak but declines a nationwide re-test as disproportionate, cataloguing the testing agency’s lapses and ordering reforms.",
    details:"The reforms would be tested again two years later." },

  // ---- Zone V · 2025–today · The Plaza -------------------------------
  { id:"governors-2025", era:"freedom", zone:4, year:"2025", side:"left", accent:"#7A5AA0", prop:"cabinet", art:"saltmarch", ledger:"Governors and the Assent to State Bills",
    title:"Governors and the Bills",
    summary:"Governors sitting on state bills for years. The Supreme Court says no “pocket veto” and deems ten Tamil Nadu bills assented. On a Presidential reference, a five-judge bench then says courts cannot impose timelines — but that indefinite inaction still invites judicial scrutiny.",
    details:"Two rulings, one year, on the same question of federal manners." },
  { id:"bihar-sir-2025", era:"freedom", zone:4, year:"2025–2026", side:"right", accent:"#2E7D5B", prop:"queue", art:"charkha", ledger:"Bihar’s Special Intensive Revision of Voter Rolls",
    title:"The Voter Rolls",
    summary:"An intensive revision of Bihar’s rolls demanding one of eleven documents — Aadhaar and voter ID at first excluded; some 65 lakh names dropped from the draft. The Supreme Court forces Aadhaar in and the deleted names out into the open, then upholds the exercise (May 2026). The model goes national.",
    details:"The interim orders are the accountability record." },
  { id:"varma-2025", era:"freedom", zone:4, year:"2025–2026", side:"left", accent:"#8E4A4A", prop:"memorial", art:"garden", ledger:"The Justice Varma Cash Discovery",
    title:"The Judge’s Outhouse",
    summary:"Firefighters find unaccounted cash at a sitting judge’s official residence. An in-house committee finds misconduct; 158 MPs move removal; a statutory inquiry is constituted. The Supreme Court rejects the judge’s challenges. Accountability, applied to the judiciary itself.",
    details:"Included because the record must cut every way." },
  { id:"neet-2026", era:"freedom", zone:4, year:"2026", side:"right", accent:"#FF9933", prop:"banner", art:"banner", ledger:"NEET-UG 2026: The Leak and the Student Protests",
    title:"The Cockroaches",
    summary:"Another leak; a march to Parliament; tear gas, lathis and pellet guns; minors detained; a minister’s resignation. The Chief Justice: peaceful protest is “absolutely guaranteed under our constitutional scheme.” The Court finds a prima facie case for an independent probe and orders the evidence preserved.",
    details:"“A police officer involved in excessive force should not be unduly protected.” Next hearing 18 August 2026." },
  { id:"finale-2026", era:"freedom", zone:4, year:"Today", side:"left", accent:"#FF9933", prop:"finale", art:"flagraise", ledger:null,
    title:"The Question Stands",
    summary:"The plaza. The flag. The same duty Article 51A wrote down: cherish the ideals of the freedom struggle; develop the scientific temper and the spirit of inquiry. Neither is a forward.",
    details:"Every plate you just passed is attached to its document. Corrections with sources are welcome." },
];

export const LEDGER_ZONES = [
  "I · The Mandate",
  "II · The Great Schemes",
  "III · The Cracks",
  "IV · The Scorched Year",
  "V · The Plaza, Today",
];
export const LEDGER_MARKER_YEARS = ["2014","2018","2021","2024","2026"];
