/* ============================================================
   THE REPUBLIC'S LEDGER — 2014 to the present
   ------------------------------------------------------------
   A documented accountability record. Every entry is written in
   neutral language and rests on primary official records: audit
   reports, court judgments, regulatory filings, parliamentary
   answers. Allegations are labelled as allegations; adjudicated
   findings as findings. Document URLs are populated only after
   being fetched and verified by the research pass — an entry
   with `url: null` is awaiting its verified link and renders as
   "link pending verification" in the UI.

   status values:
     'adjudicated' — a court has ruled
     'audited'     — an official audit body has reported
     'alleged'     — charges or claims not yet adjudicated
     'ongoing'     — investigation or litigation in progress
     'disputed'    — official figures/methodology contested
   ============================================================ */

export const LEDGER_META = {
  title: "A Cockroach's Questions",
  subtitle: "The Republic's Ledger",
  range: '2014 – present',
  preamble:
    'In the summer of 2026, India’s students were called cockroaches — and ' +
    'marched under the name. This section is written by one of them, as a ' +
    'citizen of a democracy exercising the right that defines it: to question ' +
    'the government. The walk behind you ends at midnight, 1947. Accountability ' +
    'does not end anywhere. What follows is the record of the present era, told ' +
    'only through what the official record itself says — audit reports, court ' +
    'judgments, regulatory filings, parliamentary answers — every claim linked ' +
    'to its source, so you can read the document, not the headline.',
  method:
    'Allegations are marked as allegations. Adjudicated findings are marked as findings. ' +
    'Nothing here rests on anonymous claims, and nothing is characterised beyond ' +
    'what the cited document says.',
  verifiedAsOf: '15 August 2026',   // links fetched and checked on this date
};

/* entries are ordered chronologically by the first year in `year`
   (a starting year, not the whole range, so long-running matters
   sit where they began) */
const startYear = e => parseInt(e.year, 10) || 0;
export const LEDGER = [
  {
    year: '2016', title: 'Demonetisation', status: 'adjudicated',
    summary:
      'On 8 November 2016, ₹500 and ₹1,000 notes — about 86% of currency in ' +
      'circulation — were withdrawn overnight, with stated aims of curbing black ' +
      'money and counterfeiting. The RBI’s 2017–18 Annual Report recorded that ' +
      '99.3% of the demonetised notes were returned to the banking system. In ' +
      'January 2023 a Constitution Bench upheld the decision’s legality 4–1; ' +
      'Justice B.V. Nagarathna dissented on the process followed.',
    records: [
      { body: 'RBI', title: 'Annual Report 2017–18, Ch. VIII: Currency Management', date: '29 Aug 2018',
        finding: '₹15,310.73 billion of ₹15,417.93 billion in withdrawn notes returned (~99.3%)',
        url: 'https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1235' },
      { body: 'Supreme Court', title: 'Vivek Narayan Sharma v. UoI — Constitution Bench judgment (official PDF, 388 pp.)', date: '2 Jan 2023',
        finding: 'Upheld 4–1: “satisfies the test of proportionality”; Nagarathna J. dissented, holding the notification unlawful (prospectively)',
        url: 'https://api.sci.gov.in/supremecourt/2016/37662/37662_2016_3_1501_40708_Judgement_02-Jan-2023.pdf' },
      { body: 'Parliament (PRS summary)', title: 'Standing Committee on Finance — “Transformation towards a Digital Economy”', date: 'Jan 2017',
        finding: 'Digital payments peaked after demonetisation, then tapered as cash returned',
        url: 'https://prsindia.org/policy/report-summaries/transformation-towards-a-digital-economy' },
    ],
    press: [
      { outlet: 'The Quint', title: '99.3% of demonetised currency returned: RBI report',
        url: 'https://www.thequint.com/news/india/demonetisation-money-returns-rbi-report' },
      { outlet: 'Al Jazeera', title: 'Supreme Court says 2016 demonetisation was legal',
        url: 'https://www.aljazeera.com/news/2023/1/2/indias-supreme-court-says-2016-demonetisation-decision-was-legal' },
    ],
    note: 'No CAG audit of demonetisation exists online; the Standing Committee’s dedicated draft report was never adopted or tabled.',
  },
  {
    year: '2015–21', title: 'The Rafale Deal', status: 'adjudicated',
    summary:
      'The 2016 inter-governmental purchase of 36 Rafale jets replaced a 126-jet ' +
      'tender, drawing questions on pricing and the choice of offset partner. The ' +
      'CAG audited the pricing in a partly-redacted 2019 report. The Supreme Court ' +
      'declined to order an investigation (December 2018) and dismissed review ' +
      'petitions (November 2019). France opened a judicial probe in 2021.',
    records: [
      { body: 'CAG', title: 'Report No. 3 of 2019 — Capital Acquisition in Indian Air Force (archived full text)', date: '13 Feb 2019',
        finding: '36-jet package 2.86% below the audit-aligned 2007 price; no bank guarantee unlike 2007; commercial figures redacted at MoD request; no corruption finding',
        url: 'https://www.humanrightsinitiative.org/download/C%26AG-AirForce-CapitalAcq-PerfAudit-Report3-2019.pdf' },
      { body: 'Supreme Court', title: 'Manohar Lal Sharma v. N.D. Modi — petitions dismissed', date: '14 Dec 2018',
        finding: '“No reason for any intervention”; CBI investigation declined',
        url: 'https://indiankanoon.org/doc/95183857/' },
      { body: 'Supreme Court', title: 'Yashwant Sinha v. CBI — review petitions dismissed', date: '14 Nov 2019',
        finding: 'Dismissed as without merit; Joseph J. noted the CBI remained free to seek s.17A approval',
        url: 'https://indiankanoon.org/doc/26499003/' },
      { body: 'PRS', title: 'Summary of the CAG report', date: '2019',
        finding: 'Independent summary of pricing findings',
        url: 'https://prsindia.org/policy/report-summaries/capital-acquisition-indian-air-force' },
    ],
    press: [
      { outlet: 'ThePrint', title: 'The Hindu publishes the Indian Negotiating Team dissent note (Feb 2019)',
        url: 'https://theprint.in/plugged-in/hindus-exclusive-rafale-dissent-not-exclusive-say-economic-times-caravan/191700/' },
      { outlet: 'ThePrint', title: 'France appoints a judge to probe the Rafale sale (Jul 2021)',
        url: 'https://theprint.in/defence/india-rafale-deal-under-scanner-in-france-judge-appointed-to-probe-alleged-corruption-reports/689233/' },
      { outlet: 'Supreme Court Observer', title: 'The 2019 review judgment, in plain English',
        url: 'https://www.scobserver.in/reports/manohar-lal-sharma-narendra-modi-rafale-fighter-jet-deal-review-judgment-plain-english/' },
    ],
    note: 'No Indian court or audit body found illegality. The Hindu’s reading of the 2015 MoD note was itself disputed (Parrikar’s file noting); both positions are on the record.',
  },
  {
    year: '2016–22', title: 'Bank Frauds & Fugitive Economic Offenders', status: 'ongoing',
    summary:
      'The period saw a series of major bank frauds whose principals left the ' +
      'country: Vijay Mallya (2016, Kingfisher loans ~₹9,000 cr), Nirav Modi and ' +
      'Mehul Choksi (2018, PNB letter-of-undertaking fraud ~₹14,000 cr), and ' +
      'record CBI cases against ABG Shipyard (~₹22,842 cr) and DHFL (~₹34,000 cr). ' +
      'UK courts approved the extraditions of Mallya and Nirav Modi; appeals and ' +
      'asset-recovery proceedings continue.',
    records: [
      { body: 'CBI', title: 'UK High Court dismisses Nirav Modi’s extradition appeal (CBI release)', date: '9 Nov 2022',
        finding: 'Extradition order upheld; CBI chargesheets record wrongful loss of ₹6,498 cr + ₹6,805 cr to PNB',
        url: 'https://cbi.gov.in/press-detail/NTMxNA==' },
      { body: 'ED', title: 'Restitution of properties to banks — official performance page', date: '2026',
        finding: 'Returned to banks: Mallya ₹14,131.60 cr, Nirav Modi ₹1,112.91 cr, Choksi & others ₹2,565.90 cr',
        url: 'https://www.enforcementdirectorate.gov.in/performance/restitution-of-properties-assets/' },
      { body: 'Parliament (PRS)', title: 'Fugitive Economic Offenders Act, 2018', date: 'Jul 2018',
        finding: 'Confiscation regime for absconders in ₹100 cr+ cases; Mallya declared first FEO, Jan 2019',
        url: 'https://prsindia.org/billtrack/the-fugitive-economic-offenders-bill-2018' },
      { body: 'Prasar Bharati', title: 'Belgian court clears Mehul Choksi’s extradition', date: '22 Oct 2025',
        finding: 'Antwerp court approved extradition; further Belgian steps pending as of 2026',
        url: 'https://www.newsonair.gov.in/belgian-court-clears-mehul-choksis-extradition-to-india-in-pnb-fraud-case/' },
    ],
    press: [
      { outlet: 'The Tribune', title: 'Mallya loses UK High Court appeal (Apr 2020)',
        url: 'https://www.tribuneindia.com/news/business/vijay-mallya-loses-uk-high-court-appeal-clock-set-for-extradition-to-india-73685' },
      { outlet: 'The Week', title: 'UK court refuses to reopen Nirav Modi’s extradition (Mar 2026)',
        url: 'https://www.theweek.in/news/biz-tech/2026/03/26/uk-high-court-rejects-plea-against-extradition-what-legal-options-does-nirav-modi-have-now.html' },
      { outlet: 'Business Today', title: 'ABG Shipyard: ₹22,842 cr across 28 banks',
        url: 'https://www.businesstoday.in/latest/economy/story/abg-shipyard-how-it-plunged-into-debt-and-defrauded-28-banks-of-rs-22842-cr-322621-2022-02-15' },
      { outlet: 'The Week', title: 'CBI books DHFL in ₹34,615 cr fraud',
        url: 'https://www.theweek.in/news/biz-tech/2022/06/23/cbi-books-dhfl-in-biggest-banking-fraud-of-rs-34615-crore-17-banks-hit.html' },
    ],
    note: 'Neither Mallya nor Nirav Modi had been surrendered to India as of August 2026 despite final UK orders; the frauds themselves were by private actors — the accountability question is lender oversight and recovery.',
  },
  {
    year: '2018–24', title: 'Electoral Bonds', status: 'adjudicated',
    summary:
      'The 2018 scheme allowed unlimited anonymous corporate political donations ' +
      'through bank-issued bonds. Reserve Bank and Election Commission objections ' +
      'raised before launch are on the record. On 15 February 2024 a Constitution ' +
      'Bench struck the scheme down as unconstitutional for violating voters’ ' +
      'right to information, and ordered SBI to publish all purchase data.',
    records: [
      { body: 'Supreme Court', title: 'ADR v. Union of India, 2024 INSC 113 — scheme struck down (5–0)', date: '15 Feb 2024',
        finding: 'Unconstitutional; donor anonymity violated voters’ right to information (Art. 19(1)(a)); unlimited corporate funding manifestly arbitrary (Art. 14)',
        url: 'https://indiankanoon.org/doc/121499464/' },
      { body: 'ECI / PIB', title: 'Court-ordered publication of SBI bond data', date: '21 Mar 2024',
        finding: 'Full purchaser–redeemer data published as received from SBI',
        url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2015989' },
      { body: 'RBI (RTI docs)', title: 'Pre-launch objection, 30 Jan 2017 — overruled', date: '2017',
        finding: 'Warned the bonds were in effect bearer instruments with money-laundering potential',
        url: 'https://www.reporters-collective.in/stories/electoral-bonds-seeking-secretive-funds-modi-govt-overruled-rbi' },
      { body: 'ADR', title: 'Analysis of the disclosed data', date: 'Mar 2024',
        finding: '22,217 bonds Apr 2019–Feb 2024, ~₹16,518 crore in sales; largest recipient BJP (54.77%)',
        url: 'https://adrindia.org/content/electoral-bond-data-released-heres-complete-list-donors-who-contributed-rs-10-crore-or-more' },
    ],
    press: [
      { outlet: 'LiveLaw', title: 'ECI uploads electoral bonds data per SC direction',
        url: 'https://www.livelaw.in/top-stories/election-commission-uploads-electoral-bonds-data-on-website-as-per-supreme-courts-direction-252331' },
      { outlet: 'Supreme Court Observer', title: 'Case page: constitutionality of the scheme',
        url: 'https://www.scobserver.in/cases/association-for-democratic-reforms-electoral-bonds-case-background/' },
    ],
  },
  {
    year: '2020–', title: 'PM CARES Fund', status: 'disputed',
    summary:
      'Created in March 2020 for pandemic relief, the fund is chaired by the Prime ' +
      'Minister, carries state symbols, and received public-sector contributions — ' +
      'but has been maintained in litigation to be neither a "public authority" ' +
      'under the RTI Act nor subject to CAG audit; it is audited by a private ' +
      'chartered-accountant firm. Its transparency remains contested in the ' +
      'Delhi High Court.',
    records: [
      { body: 'PMO (litigation)', title: 'Affidavits: “not a public authority” under RTI; “not a Government of India fund”', date: '2021 & 2023',
        finding: 'RTI applicability denied in the Samyak Gangwal case; appeal pending in Delhi HC as of 2026',
        url: 'https://www.livelaw.in/news-updates/pm-cares-fund-public-authority-rti-act-parliament-govt-pmo-delhi-high-court-220299' },
      { body: 'PM CARES', title: 'Official FAQ — trust status and private audit', date: 'current',
        finding: 'Audited by an independent CA firm (KKC & Associates LLP), not the CAG',
        url: 'https://pmcares.gov.in/en/web/page/faq' },
      { body: 'PM CARES', title: 'Published audited statement FY 2022–23', date: '2023',
        finding: 'Statements published on the fund’s own site (scanned PDFs)',
        url: 'https://pmcares.gov.in/assets/donation/pdf/Audited_Statement_2022_23.pdf' },
    ],
    press: [
      { outlet: 'The Print', title: 'PMO to Delhi HC: charitable trust, not a “public authority”',
        url: 'https://theprint.in/judiciary/pm-cares-fund-a-charitable-trust-not-public-authority-under-rti-pmo-informs-delhi-hc/1345175/' },
    ],
    note: 'No court has found misuse of the fund; the dispute is about opacity, RTI coverage and audit arrangements.',
  },
  {
    year: '2020–23', title: 'Central Vista Redevelopment', status: 'adjudicated',
    summary:
      'The rebuild of Delhi’s government district — new Parliament included — drew ' +
      'criticism over pandemic-era timing, a compressed consultant-selection ' +
      'process, and cost: sanctioned outlay rose from ₹12,762 crore to ₹13,170 ' +
      'crore per a 2026 parliamentary answer. The Supreme Court cleared the ' +
      'project 2–1 in January 2021; Justice Sanjiv Khanna dissented on the ' +
      'adequacy of public consultation. Nineteen opposition parties boycotted ' +
      'the 2023 inauguration. No wrongdoing has been adjudicated.',
    records: [
      { body: 'Supreme Court', title: 'Rajeev Suri v. DDA — project upheld 2–1', date: 'Jan 2021',
        finding: 'Cleared; dissent found public consultation inadequate',
        url: 'https://indiankanoon.org/doc/126137620/' },
      { body: 'Lok Sabha (reply)', title: 'Cost revision reported in Parliament', date: 'Feb 2026',
        finding: '₹12,762.49 cr → ₹13,169.61 cr, attributed to price escalation',
        url: 'https://www.millenniumpost.in/amp/nation/central-vista-redevelopment-advances-cost-rises-to-rs-13169-crore-government-tells-parliament-648148' },
    ],
    press: [
      { outlet: 'Al Jazeera', title: 'Criticism of continuing the project amid COVID-19',
        url: 'https://www.aljazeera.com/news/2021/5/17/central-vista-indias-modi-slammed-for-vanity-project-amid-covid' },
      { outlet: 'TIME', title: 'Why the new Parliament building was controversial',
        url: 'https://time.com/6282819/india-parliament-narendra-modi-controversy/' },
    ],
  },
  {
    year: '2021–22', title: 'Pegasus Surveillance Allegations', status: 'ongoing',
    summary:
      'The 2021 Pegasus Project reported that Indian journalists, politicians and ' +
      'activists appeared on a list associated with military-grade spyware sold ' +
      'only to governments. The Supreme Court appointed a technical committee ' +
      'after recording that the Union did not specifically deny the allegations. ' +
      'In 2022 the Court noted malware on 5 of 29 examined phones (Pegasus not ' +
      'conclusively identified) — and that the government had not cooperated.',
    records: [
      { body: 'Supreme Court', title: 'M.L. Sharma v. UoI — Raveendran committee constituted', date: '27 Oct 2021',
        finding: '“No specific denial” of the surveillance averments by the Union recorded (para 51)',
        url: 'https://indiankanoon.org/doc/39021018/' },
      { body: 'Supreme Court', title: 'Committee findings recorded in open court', date: '25 Aug 2022',
        finding: 'Malware on 5 of 29 devices, Pegasus not conclusively identified; “Government of India has not cooperated” — CJI Ramana',
        url: 'https://www.livelaw.in/top-stories/supreme-court-pegasus-malware-in-529-devices-says-centre-did-not-cooperate-cji-ramana-207435' },
      { body: 'Parliament (IT Committee)', title: 'Committee meeting collapsed for want of quorum', date: '28 Jul 2021',
        finding: 'Ministry officials absent; 14 members declined to sign the register',
        url: 'https://www.tribuneindia.com/news/nation/pegasus-fallout-it-panel-meet-put-off-after-bjp-mps-boycott-preventing-quorum-289550' },
    ],
    press: [
      { outlet: 'The Wire', title: 'Snoop list: 40 Indian journalists; Pegasus confirmed forensically on some devices',
        url: 'https://thewire.in/media/pegasus-project-spyware-indian-journalists' },
      { outlet: 'Forbidden Stories', title: 'The Pegasus Project (consortium)',
        url: 'https://forbiddenstories.org/case/the-pegasus-project/' },
    ],
    note: 'The committee’s reports remain sealed; findings are known through the Court’s recorded observations.',
  },
  {
    year: '2020–22', title: 'COVID-19 Second Wave', status: 'disputed',
    summary:
      'India’s 2021 second wave overwhelmed hospitals and oxygen supply. The ' +
      'WHO’s excess-mortality estimate for 2020–21 (~4.7 million deaths) is ' +
      'roughly ten times the official toll at the time; the government formally ' +
      'disputes the methodology. In Parliament the Centre stated no oxygen-shortage ' +
      'deaths were "specifically reported" by states; a parliamentary committee ' +
      'later sought an audit of such deaths. This entry is kept deliberately spare.',
    records: [
      { body: 'Parl. Standing Committee (Health)', title: '123rd Report — pandemic management (pre-wave warning)', date: '21 Nov 2020',
        finding: 'Hospital beds “grossly inadequate”; recommended ensuring oxygen production “as per demand in hospitals”',
        url: 'https://www.businesstoday.in/current/economy-politics/covid-19-parliamentary-panel-had-warned-about-oxygen-hospital-bed-shortage-in-november/story/437584.html' },
      { body: 'Delhi High Court', title: 'Oxygen-supply hearing — “beg, borrow or steal”', date: '21 Apr 2021',
        finding: 'Centre directed to secure supply; “we might lose thousands of lives for lack of oxygen”',
        url: 'https://www.livelaw.in/top-stories/beg-borrow-or-steal-oxygen-delhi-high-court-to-centre-might-lose-thousands-of-lives-172916' },
      { body: 'Rajya Sabha (MoHFW reply)', title: 'Written reply on oxygen-shortage deaths', date: '20 Jul 2021',
        finding: '“No deaths due to lack of oxygen have been specifically reported by states / UTs”',
        url: 'https://www.downtoearth.org.in/health/passing-the-buck-no-deaths-due-to-lack-of-oxygen-reported-by-states-centre-says-78047' },
      { body: 'Parl. Standing Committee (Health)', title: '137th Report — recommended an audit of oxygen-shortage deaths', date: '12 Sep 2022',
        finding: 'Ministry’s 2020 assurance of oxygen self-sufficiency “brutally exposed”; audit of such deaths recommended',
        url: 'https://www.downtoearth.org.in/news/governance/audit-covid-19-death-from-oxygen-shortage-parliamentary-panel-to-health-ministry-84927' },
      { body: 'WHO', title: 'Global excess deaths associated with COVID-19, 2020–21', date: 'May 2022',
        finding: '14.9M excess deaths globally; India ~4.7M in the accompanying dataset vs ~481,000 reported',
        url: 'https://www.who.int/data/stories/global-excess-deaths-associated-with-covid-19-january-2020-december-2021' },
      { body: 'MoHFW (via IndiaSpend)', title: 'Government objection to the WHO methodology', date: '5 May 2022',
        finding: 'Called the estimates “statistically unsound and scientifically questionable”; India the only member state to formally reject them',
        url: 'https://www.isignal.in/covid-19/india-had-most-pandemic-related-deaths-of-any-country-at-47-million-says-who-816250' },
    ],
    press: [
      { outlet: 'Al Jazeera', title: 'Rallies and religious gatherings during the surge (Apr 2021)',
        url: 'https://www.aljazeera.com/news/2021/4/9/rallies-religious-gatherings-aggravate-indias-worst-covid-surge' },
    ],
    note: 'Committee reports and the Rajya Sabha reply are linked via press summaries; the primary PDFs on sansad.in were not retrievable. No official outcome of the recommended audit was found.',
  },
  {
    year: '2022–25', title: 'What the CAG Found', status: 'audited',
    summary:
      'The Comptroller & Auditor General’s tablings of this period include: a ' +
      '2022 audit tying 26% of derailments to track renewals with safety-fund ' +
      'shortfalls, months before Balasore; 2023 audits finding Ayushman Bharat ' +
      'claims paid for patients earlier recorded as dead and ~7.5 lakh ' +
      'beneficiaries on a single mobile number, and Dwarka Expressway sanctioned ' +
      'at ₹250.77 crore/km against ₹18.2 crore/km approved; and a 2025 audit ' +
      'finding invalid bank details in over 94% of PMKVY skill-scheme records. ' +
      'Weeks after the 2023 tablings, the officers who led the Bharatmala and ' +
      'Ayushman audits were transferred — "administrative convenience," said the ' +
      'CAG. Reports tabled per year fell from an average of 40 (2014–18) to 18 ' +
      'in 2023, the lowest on record.',
    records: [
      { body: 'CAG', title: 'Report 22 of 2022 — Derailments in Indian Railways', date: 'Dec 2022',
        finding: '26% of 1,127 derailments linked to track renewals; safety-fund contribution shortfalls',
        url: 'https://cag.gov.in/rly/new-delhi-ii/en/audit-report/details/117808' },
      { body: 'CAG', title: 'Report 11 of 2023 — Ayushman Bharat PM-JAY', date: 'Aug 2023',
        finding: 'Claims paid for patients shown as deceased; ~7.5 lakh beneficiaries on one mobile number',
        url: 'https://cag.gov.in/en/audit-report/details/119060' },
      { body: 'CAG', title: 'Report 19 of 2023 — Bharatmala Phase-I / Dwarka Expressway', date: 'Aug 2023',
        finding: '₹250.77 cr/km sanctioned vs ₹18.2 cr/km approved; DPR submitted after approval',
        url: 'https://cag.gov.in/en/audit-report/details/119177' },
      { body: 'CAG', title: 'Report 10 of 2023 — National Social Assistance Programme', date: 'Aug 2023',
        finding: 'Ineligible beneficiaries; over-, short- and multiple pension payments',
        url: 'https://cag.gov.in/en/audit-report/details/119044' },
      { body: 'CAG', title: 'Report 20 of 2025 — PM Kaushal Vikas Yojana (full PDF)', date: '18 Dec 2025',
        finding: 'Bank-account fields blank/invalid in 90.66 of 95.90 lakh records; duplicate identities and photos; ~41% of trainees placed',
        url: 'https://cag.gov.in/webroot/uploads/download_audit_report/2025/Report-No.-20-of-2025_PA-PMKVY_English-PDF-A-06943abec463479.68516873.pdf' },
    ],
    press: [
      { outlet: 'ThePrint', title: 'What’s in the CAG report on the ₹250-cr/km Dwarka Expressway',
        url: 'https://theprint.in/india/oppn-cries-scam-govt-says-erroneous-whats-in-cag-report-on-rs-250-cr-km-dwarka-expressway/1718639/' },
      { outlet: 'The Wire', title: 'Officers in charge of the Ayushman/Bharatmala audits transferred',
        url: 'https://m.thewire.in/article/government/officers-cag-reports-ayushman-bharat-bharatmala-transferred' },
      { outlet: 'The Wire', title: 'CAG reports tabled in 2023 hit a record low (The Hindu data)',
        url: 'https://m.thewire.in/article/government/very-low-number-of-cag-reports-tables-in-parliament-in-2023' },
    ],
    note: 'MoRTH called the Dwarka cost comparison erroneous; the Balasore CRS inquiry report itself was not made public. Departmental responses are recorded in each report.',
  },
  {
    year: '2023–26', title: 'Adani Group Investigations', status: 'alleged',
    summary:
      'Hindenburg Research (a short-seller) alleged stock manipulation and ' +
      'accounting fraud in January 2023; the group denied everything. A ' +
      'Supreme Court expert committee found no regulatory failure “as of now” ' +
      '(May 2023); the Court kept the probe with SEBI (January 2024), noting 22 ' +
      'of 24 investigations complete. In September 2025 SEBI disposed of the ' +
      'related-party proceedings with no penalties. In the US, a November 2024 ' +
      'indictment charged Gautam Adani and others with bribery and fraud; on ' +
      '10 August 2026 a federal judge dismissed the fraud counts against him at ' +
      'the Justice Department’s own request — without trial — while calling ' +
      'the irregularities in that decision “concerning”; bribery counts against ' +
      'five others remain pending. No court or regulator has found wrongdoing.',
    records: [
      { body: 'Supreme Court', title: 'Vishal Tiwari v. UoI, 2024 INSC 3 — probe stays with SEBI', date: '3 Jan 2024',
        finding: 'No transfer to SIT/CBI; 22 of 24 SEBI probes done, rest “preferably within three months”; OCCRP report not conclusive proof',
        url: 'https://indiankanoon.org/doc/198913927/' },
      { body: 'SC Expert Committee (Sapre)', title: 'Report on the Adani–Hindenburg matter (via LiveLaw)', date: '19 May 2023',
        finding: '“Cannot, as of now, arrive at a finding of regulatory failure”; findings expressly prima facie',
        url: 'https://www.livelaw.in/top-stories/supreme-court-sc-adani-hindenburg-report-expert-committee-securities-and-exchange-board-of-india-sebi-regulatory-failure-229112' },
      { body: 'SEBI (via Prasar Bharati)', title: 'Orders disposing of the related-party show-cause proceedings', date: '18 Sep 2025',
        finding: 'No LODR/PFUTP violation found; “no basis for assigning liability or imposing penalties”',
        url: 'https://www.newsonair.gov.in/sebi-clears-gautam-adani-and-group-of-allegations-made-by-hindenburg-research' },
      { body: 'US District Court, EDNY (via CBS News)', title: 'Order on DOJ’s motion to dismiss, US v. Adani et al.', date: '10 Aug 2026',
        finding: 'Fraud counts against Gautam Adani, Sagar Adani and Vneet Jaain dismissed with prejudice at DOJ request; judge criticised process irregularities; counts against five others pending',
        url: 'https://www.cbsnews.com/news/judge-doj-gautam-adani-india-trump-administration/' },
    ],
    press: [
      { outlet: 'OCCRP', title: 'Documents on offshore investors linked to the group (Aug 2023)',
        url: 'https://www.occrp.org/en/investigation/documents-provide-fresh-insight-into-allegations-of-stock-manipulation-that-rocked-indias-powerful-adani-group' },
      { outlet: 'OCCRP', title: 'SEC moves to settle its civil case, no-admit/no-deny (May 2026)',
        url: 'https://www.occrp.org/en/news/us-securities-regulator-moves-to-settle-adani-civil-case' },
      { outlet: 'The Wire', title: 'US judge dismisses the fraud charges but rejects DOJ’s claim that India investigated (Aug 2026)',
        url: 'https://m.thewire.in/article/law/us-judge-dismisses-adani-fraud-charges-but-rejects-doj-claim-that-india-investigated-bribery' },
    ],
    note: 'The DOJ, SEC and Hindenburg source pages blocked automated fetching and are cited via press. Every allegation was denied by the group; the remaining US counts are unproven, with DOJ due to justify their dismissal by 31 Aug 2026.',
  },
  {
    year: '2014–', title: 'Central Agencies & the Opposition', status: 'disputed',
    summary:
      'Published data analyses found that roughly 95% of Enforcement Directorate ' +
      'cases against politicians since 2014 involved opposition figures — a ' +
      'pattern the government denies and attributes to where offences occurred. ' +
      'Courts granting bail in several high-profile cases criticised aspects of ' +
      'the agency’s conduct; conviction rates in political cases remain low.',
    records: [
      { body: 'Supreme Court (SC Observer)', title: 'Arvind Kejriwal v. CBI — bail', date: '13 Sep 2024',
        finding: 'Bail granted; Bhuyan J.: CBI “became active” only after ED bail, must “dispel the notion of it being a caged parrot”',
        url: 'https://www.scobserver.in/journal/arvind-kejriwals-bail-in-cbi-case-judgement-summary/' },
      { body: 'Supreme Court (AIR)', title: 'Manish Sisodia — bail after 17 months without trial', date: '9 Aug 2024',
        finding: 'Prolonged custody without trial commencing violated the right to a speedy trial',
        url: 'https://www.newsonair.gov.in/supreme-court-grants-bail-to-manish-sisodia-in-excise-policy-case' },
    ],
    press: [
      { outlet: 'The Wire (citing Indian Express)', title: '121 politicians under ED since 2014, 115 from the opposition; 25 who joined the BJP, 23 got reprieve',
        url: 'https://m.thewire.in/article/politics/25-leaders-facing-corruption-investigation-joined-bjp-since-2014-23-got-reprieve' },
    ],
    note: 'The Indian Express dataset (Sep 2022) is cited via The Wire; the government attributes the pattern to where offences occurred.',
  },
  {
    year: '2024', title: 'Chandigarh Mayoral Election', status: 'adjudicated',
    summary:
      'The presiding officer was recorded on camera defacing ballots. The Supreme ' +
      'Court examined the ballots itself, declared the defrauded candidate the ' +
      'lawful winner, and initiated proceedings against the officer — with the ' +
      'Chief Justice observing in court that what occurred was a "mockery of ' +
      'democracy".',
    records: [
      { body: 'Supreme Court', title: 'Kuldeep Kumar v. UT Chandigarh, 2024 INSC 129', date: '20 Feb 2024',
        finding: 'All eight “invalid” ballots held validly cast; result set aside under Art. 142; s.340 CrPC notice to the presiding officer',
        url: 'https://indiankanoon.org/doc/14318830/' },
    ],
    press: [
      { outlet: 'LiveLaw', title: '“This is a murder of democracy” — the CJI’s remarks after viewing the counting video (5 Feb 2024)',
        url: 'https://www.livelaw.in/top-stories/chandigarh-mayor-election-obvious-that-presiding-officer-defaced-ballot-papers-this-is-murder-of-democracy-supreme-court-248558' },
    ],
  },
  {
    year: '2023', title: 'Who Appoints the Election Commission', status: 'adjudicated',
    summary:
      'In March 2023 a Constitution Bench held that, until Parliament legislated, ' +
      'Election Commissioners should be chosen by a panel of the Prime Minister, ' +
      'the Leader of Opposition and the Chief Justice of India. Parliament ' +
      'legislated nine months later — replacing the Chief Justice on the panel ' +
      'with a Cabinet Minister nominated by the Prime Minister. A constitutional ' +
      'challenge to the Act is pending.',
    records: [
      { body: 'Supreme Court', title: 'Anoop Baranwal v. UoI (Constitution Bench)', date: '2 Mar 2023',
        finding: 'PM–LoP–CJI selection panel directed until Parliament legislates',
        url: 'https://indiankanoon.org/doc/56882156/' },
      { body: 'Parliament (PRS)', title: 'CEC & Other ECs (Appointment…) Act, 2023', date: 'Dec 2023',
        finding: 'Panel of PM, a Union Cabinet Minister and LoP — the CJI removed',
        url: 'https://prsindia.org/billtrack/the-chief-election-commissioner-and-other-election-commissioners-appointment-conditions-of-service-and-term-of-office-bill-2023' },
    ],
    press: [],
  },
  {
    year: '2025', title: 'Governors and the Assent to State Bills', status: 'adjudicated',
    summary:
      'Several opposition-ruled states litigated over Governors sitting on bills ' +
      'for years. In April 2025 the Supreme Court held there is no “pocket veto” ' +
      'under Article 200, indicated timelines, and deemed ten Tamil Nadu bills ' +
      'assented to. The President then referred fourteen questions to the Court; ' +
      'in November 2025 a five-judge bench opined that courts cannot impose ' +
      'timelines or deem assent — while holding that Governors cannot ' +
      'indefinitely withhold decisions and that prolonged, unexplained inaction ' +
      'invites limited judicial scrutiny.',
    records: [
      { body: 'Supreme Court', title: 'State of Tamil Nadu v. Governor of Tamil Nadu, 2025 INSC 481', date: '8 Apr 2025',
        finding: 'No pocket veto; timelines indicated; ten pending bills deemed assented under Art. 142',
        url: 'https://indiankanoon.org/doc/82729634/' },
      { body: 'Supreme Court', title: 'Presidential Reference No. 1 of 2025 — advisory opinion (SC Observer case page)', date: '20 Nov 2025',
        finding: 'Courts cannot prescribe timelines or deem assent; indefinite inaction still reviewable',
        url: 'https://www.scobserver.in/cases/presidential-reference-on-powers-of-the-governor-and-president-re-assent-withholding-or-reservation-of-bills-by-the-governor-and-president-of-india/' },
    ],
    press: [],
    note: 'Summaries of the November 2025 opinion vary in emphasis between sources; the entry follows the majority reading and the Court’s own recorded phrasing on “limited judicial scrutiny”.',
  },
  {
    year: '2025–26', title: 'Bihar’s Special Intensive Revision of Voter Rolls', status: 'adjudicated',
    summary:
      'In June 2025 the Election Commission ordered an intensive revision of ' +
      'Bihar’s electoral rolls requiring one of eleven documents — Aadhaar, ' +
      'voter ID and ration cards initially excluded; some 65 lakh names were ' +
      'reported dropped from the draft roll. The Supreme Court declined to stay ' +
      'the exercise but ordered Aadhaar accepted as proof of identity and the ' +
      'deleted names published. On 27 May 2026 it upheld the revision as “not ' +
      'manifestly excessive or disproportionate”; the model then rolled out ' +
      'nationwide.',
    records: [
      { body: 'Supreme Court (SC Observer case tracker)', title: 'ADR v. ECI, W.P.(C) 640/2025 — interim directions and final judgment', date: 'Aug 2025 – May 2026',
        finding: 'Aadhaar to be accepted (Sep 2025); deleted names to be published; SIR upheld 27 May 2026',
        url: 'https://www.scobserver.in/cases/challenge-to-the-ecis-revision-of-electoral-rolls-in-bihar-sir-association-for-democratic-reforms-v-election-commission-of-india/' },
    ],
    press: [],
    note: 'The judgment PDF (reported as 2026 INSC 564) was not fetched; the case tracker is the verified record.',
  },
  {
    year: '2025–26', title: 'The Justice Varma Cash Discovery', status: 'ongoing',
    summary:
      'In March 2025 firefighters reportedly found large amounts of unaccounted ' +
      'cash at the official residence of a sitting Delhi High Court judge. A ' +
      'Supreme Court in-house committee found him responsible for misconduct; ' +
      '158 MPs moved removal motions in July 2025, and the Lok Sabha Speaker ' +
      'constituted an inquiry under the Judges (Inquiry) Act. The Supreme Court ' +
      'rejected the judge’s challenges, most recently in January 2026. The ' +
      'statutory inquiry continues.',
    records: [
      { body: 'Supreme Court', title: 'X v. Office of the Speaker, W.P.(C) 1233/2025 — challenge to the inquiry committee dismissed (via LiveLaw)', date: '16 Jan 2026',
        finding: 'Speaker committed no illegality in constituting the committee; petitioner “not entitled to any relief”',
        url: 'https://www.livelaw.in/supreme-court/supreme-court-rejects-justice-yashwant-varmas-challenge-to-lok-sabha-speakers-formation-of-inquiry-committee-in-impeachment-motion-519271' },
    ],
    press: [],
    note: 'Included as an institutional-integrity record of the judiciary; the in-house report and parliamentary motions are documented via the Court’s judgment as reported.',
  },
  {
    year: '2026', title: 'NEET-UG 2026: The Leak and the Student Protests', status: 'ongoing',
    summary:
      'NEET-UG 2026 (3 May, ~22.7 lakh candidates) was cancelled on 12 May after a ' +
      'pre-circulated “guess paper” traced to Sikar, Rajasthan was found to match ' +
      'up to 120–140 of 180 questions; the CBI took over and a re-test was held on ' +
      '21 June. Student protests began at Jantar Mantar on 6 June and culminated ' +
      'in the 20 July “Sansad Chalo” march, where Delhi Police used lathis, tear ' +
      'gas and water cannon and were accused of using pellet guns; petitioners ' +
      'told the Supreme Court a student lost his eyesight and minors were ' +
      'detained, while police reported 118 personnel injured. On 25 July the ' +
      'Education Minister resigned and the protest was called off on assurances. ' +
      'A bench led by the Chief Justice held the right to peaceful protest ' +
      '“absolutely guaranteed”, found a prima facie case for an independent ' +
      'probe, ordered minors released and coercive action halted, and is now ' +
      'weighing an SIT versus a retired-judge committee and a protocol on pellet ' +
      'guns. Next hearing 18 August 2026.',
    remarks: [
      { who: 'CJI Surya Kant', date: '27 Jul 2026',
        quote: 'Right to protest… peaceful protest is absolutely guaranteed under our constitutional scheme. They have a right to agitate… there should not be impediment or restriction.',
        context: 'agreeing to hear the PILs on police excesses',
        url: 'https://lawbeat.in/amp/top-stories/neet-paper-leak-protests-supreme-court-to-hear-pils-on-july-28-cji-says-there-should-be-no-restrictions-on-right-to-agitate-1616188' },
      { who: 'Justice Joymalya Bagchi', date: '27 Jul 2026',
        quote: 'Injury to any individual, each is of equal concern… we will call upon the state to explain why adequate safeguards to the police is not there.',
        context: 'on submissions that police personnel too were injured',
        url: 'https://lawbeat.in/amp/top-stories/neet-paper-leak-protests-supreme-court-to-hear-pils-on-july-28-cji-says-there-should-be-no-restrictions-on-right-to-agitate-1616188' },
      { who: 'CJI Surya Kant', date: '28 Jul 2026',
        quote: 'If we broadly combine the allegations, one is the use of pellet guns, a boy suffered loss of eyesight… use of electric batons and lathis.',
        context: 'summarising the petitioners’ allegations before passing interim directions',
        url: 'https://lawbeat.in/amp/top-stories/neet-paper-leak-protests-supreme-courts-orders-release-of-minor-students-stays-coercive-action-1616621' },
      { who: 'The bench — written order', date: '28 Jul 2026',
        quote: 'The allegations made by the petitioners, prima facie, disclosed a compelling case for an independent and impartial investigation.',
        context: 'Shailendra Mani Tripathi v. Union of India, 2026 SCC OnLine SC 1409',
        url: 'https://www.scconline.com/blog/post/2026/07/29/neet-paper-leak-protest-proceedings-sc-interim-directions-police-violence/' },
      { who: 'The bench — written order', date: '28 Jul 2026',
        quote: 'No coercive measures shall be taken against the protesting students, except persons with criminal antecedents… all CCTV footage, drone footage, body-worn camera recordings, videography, wireless communication records… be preserved.',
        context: 'and: minors without antecedents to be released; protesters’ personal data not to be published',
        url: 'https://www.scconline.com/blog/post/2026/07/29/neet-paper-leak-protest-proceedings-sc-interim-directions-police-violence/' },
      { who: 'CJI Surya Kant', date: '28 Jul 2026',
        quote: 'There are always uninvited guests who enter with their own agendas and then they become the host… Everything has to be probed scientifically. In 2026, they [safeguards on police conduct] have to be stronger.',
        context: 'on non-student elements and on police safeguards',
        url: 'https://www.theweek.in/news/india/2026/07/28/supreme-court-neet-protest-fir-stay.html' },
      { who: 'Solicitor General Tushar Mehta (for the Union)', date: '28 Jul 2026',
        quote: 'Students have a right to protest… I am with the students. I don’t believe students would have committed violence.',
        context: 'the Centre said it had no objection to an independent probe; attribution per The Week’s report',
        url: 'https://www.theweek.in/news/india/2026/07/28/supreme-court-neet-protest-fir-stay.html' },
      { who: 'CJI Surya Kant', date: '3 Aug 2026',
        quote: 'The word criminal antecedents is to be read as grave and heinous offences… NCT of Delhi and any other State shall be at liberty to close/withdraw FIRs against protesters.',
        context: 'clarifying the 28 July order after it was read to deny protection to any student with an FIR',
        url: 'https://www.tribuneindia.com/news/india/cjp-protests-states-can-close-withdraw-firs-except-against-those-facing-serious-offences-says-sc/' },
      { who: 'CJI Surya Kant', date: '3 Aug 2026',
        quote: 'A police officer involved in excessive force should not be unduly protected… We would like to lay down a complete protocol on how and where pellet guns can be used.',
        context: 'on accountability for excesses; the Court is choosing between an SIT and a retired-judge-led committee',
        url: 'https://www.tribuneindia.com/news/india/cjp-protests-states-can-close-withdraw-firs-except-against-those-facing-serious-offences-says-sc/' },
      { who: 'Dharmendra Pradhan, Union Education Minister', date: '25 Jul 2026',
        quote: 'I deeply respect the aspirations, feelings, and legitimate expectations of the country’s youth.',
        context: 'announcing his resignation',
        url: 'https://www.aljazeera.com/news/2026/7/25/indias-education-minister-resigns-after-weeks-of-cockroach-protests' },
    ],
    records: [
      { body: 'Supreme Court', title: 'Shailendra Mani Tripathi v. UoI, 2026 SCC OnLine SC 1409 — interim order (SCC Online summary)', date: '28 Jul 2026',
        finding: 'Prima facie case for independent probe; minors released; no coercive action; evidence preserved; protesters’ data protected',
        url: 'https://www.scconline.com/blog/post/2026/07/29/neet-paper-leak-protest-proceedings-sc-interim-directions-police-violence/' },
      { body: 'Supreme Court', title: 'Clarification of the 28 July order (via The Tribune)', date: '3 Aug 2026',
        finding: '“Criminal antecedents” = grave and heinous offences; states free to close/withdraw FIRs; pellet-gun protocol coming',
        url: 'https://www.tribuneindia.com/news/india/cjp-protests-states-can-close-withdraw-firs-except-against-those-facing-serious-offences-says-sc/' },
      { body: 'Supreme Court', title: 'Refusal of urgent mention, then clarification that no petition had been filed', date: '22–24 Jul 2026',
        finding: '“Don’t waste our time” (22 Jul); “not a paper was filed… people started recklessly reporting it” (24 Jul)',
        url: 'https://www.livelaw.in/amp/top-stories/dont-waste-our-time-supreme-court-refuses-urgent-listing-of-plea-against-police-action-on-student-protesters-542319' },
    ],
    press: [
      { outlet: 'JURIST', title: 'Supreme Court clarifies student-protest order (11 Aug 2026)',
        url: 'https://www.jurist.org/news/2026/08/india-dispatch-supreme-court-clarifies-student-protest-order-exposing-ad-hoc-policing-of-dissent/' },
      { outlet: 'The Leaflet', title: 'Only protesters with heinous antecedents lose protection (4 Aug 2026)',
        url: 'https://theleaflet.in/leaflet-reports/supreme-court-clarifies-that-only-student-protestors-with-heinous-criminal-antecedents-will-not-be-protected' },
      { outlet: 'Al Jazeera', title: 'Education minister resigns; protests called off (25 Jul 2026)',
        url: 'https://www.aljazeera.com/news/2026/7/25/indias-education-minister-resigns-after-weeks-of-cockroach-protests' },
      { outlet: 'ThePrint', title: 'From JNU to Jamia to Jantar Mantar — questions over Delhi Police force',
        url: 'https://theprint.in/opinion/newsmaker-of-the-week/jnu-jamia-jantar-mantar-delhi-police-cjp-protests/2996370/' },
    ],
    note: 'A live entry, compiled 15 Aug 2026 with the next hearing three days away. The eyesight-loss claim is the petitioners’ allegation as recorded by the CJI, not a finding. Injury and detention figures are contested. A widely-repeated earlier remark attributed to the CJI could not be verified against a primary source and is not included.',
  },
  {
    year: '2024', title: 'NEET-UG 2024 Paper Leak', status: 'ongoing',
    summary:
      'The 2024 medical entrance exam was hit by a paper leak traced across ' +
      'multiple states, alongside record numbers of perfect scores and grace-mark ' +
      'irregularities. The Supreme Court monitored proceedings and the CBI filed ' +
      'chargesheets; the Court held the leak was not systemic enough to cancel ' +
      'the exam nationally, while confirming the leak itself.',
    records: [
      { body: 'Supreme Court', title: 'Vanshika Yadav v. UoI — reasoned judgment', date: '2 Aug 2024',
        finding: 'Leak confirmed at Hazaribagh and Patna (~155 beneficiaries); re-test refused as disproportionate; NTA lapses catalogued; reform committee directed',
        url: 'https://indiankanoon.org/doc/44343595/' },
    ],
    press: [
      { outlet: 'ThePrint', title: 'Five CBI chargesheets, 45 accused; alleged mastermind arrested Apr 2025',
        url: 'https://theprint.in/india/year-after-neet-ug-2024-paper-leak-bihar-police-arrest-mastermind-sanjeev-mukhiya/2603382/' },
    ],
  },
].sort((a, b) => startYear(a) - startYear(b));
