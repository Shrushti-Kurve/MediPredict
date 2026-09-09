export const mockUsers = [
  {
    id: "U001",
    name: "Dr. Sarah Paul",
    email: "doctor@example.com",
    phone: "9876543210",
    password: "password",
    role: "doctor",
    status: "Active",
    registrationDate: "2026-01-15"
  },
  {
    id: "U002",
    name: "John Doe (Staff)",
    email: "staff@example.com",
    phone: "9876543211",
    password: "password",
    role: "hospitalStaff",
    status: "Active",
    registrationDate: "2026-02-01"
  },
  {
    id: "U003",
    name: "Alice Green (Pharmacist)",
    email: "pharmacist@example.com",
    phone: "9876543212",
    password: "password",
    role: "pharmacist",
    status: "Active",
    registrationDate: "2026-02-10"
  },
  {
    id: "U004",
    name: "System Administrator 1",
    email: "admin1@medipredict.com",
    phone: "9876543213",
    password: "MPAdmin@2026#01",
    role: "admin",
    status: "Active",
    registrationDate: "2026-01-01"
  },
  {
    id: "U005",
    name: "System Administrator 2",
    email: "admin2@medipredict.com",
    phone: "9876543214",
    password: "MPAdmin@2026#02",
    role: "admin",
    status: "Active",
    registrationDate: "2026-01-01"
  }
];

export const mockPatients = [
  {
    id: "P1001",
    name: "Ramesh Kumar",
    dob: "1975-04-12",
    age: 51,
    gender: "Male",
    bloodGroup: "O+",
    phone: "9812345670",
    email: "ramesh.kumar@email.com",
    address: "Village Rampur, Ward 4, Bihar",
    emergencyContact: "Sita Devi - 9812345671",
    disease: "Hypertension & Mild Diabetes",
    medicines: [
      {
        id: "MED-01",
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily (Morning)",
        duration: "30 days",
        quantity: 30,
        instructions: "Take with water after breakfast"
      },
      {
        id: "MED-02",
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily (1-0-1)",
        duration: "30 days",
        quantity: 60,
        instructions: "Take with meals"
      }
    ],
    medicine: "Amlodipine, Metformin",
    medicineQuantity: 90,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-01",
    nextVisit: "2026-09-01",
    status: "Under Observation"
  },
  {
    id: "P1002",
    name: "Sunita Sharma",
    dob: "1988-09-24",
    age: 37,
    gender: "Female",
    bloodGroup: "A+",
    phone: "9823456781",
    email: "sunita.sharma@email.com",
    address: "Village Pipra, Gwalior, MP",
    emergencyContact: "Vikram Sharma - 9823456782",
    disease: "Diabetes Type 2",
    medicines: [
      {
        id: "MED-03",
        name: "Metformin",
        dosage: "1000mg",
        frequency: "Twice daily (1-0-1)",
        duration: "30 days",
        quantity: 60,
        instructions: "Take after food"
      },
      {
        id: "MED-04",
        name: "Glucosamine",
        dosage: "500mg",
        frequency: "Once daily (Night)",
        duration: "15 days",
        quantity: 15,
        instructions: "Take before sleep"
      }
    ],
    medicine: "Metformin, Glucosamine",
    medicineQuantity: 75,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-07-28",
    nextVisit: "2026-08-28",
    status: "Active"
  },
  {
    id: "P1003",
    name: "Anil Singh",
    dob: "1960-11-05",
    age: 65,
    gender: "Male",
    bloodGroup: "B+",
    phone: "9834567892",
    email: "anil.singh@email.com",
    address: "Balarampur Village, Purulia, WB",
    emergencyContact: "Rajesh Singh - 9834567893",
    disease: "Chronic Asthma & Bronchospasm",
    medicines: [
      {
        id: "MED-05",
        name: "Salbutamol Inhaler",
        dosage: "100mcg (2 puffs)",
        frequency: "Twice daily / SOS",
        duration: "30 days",
        quantity: 2,
        instructions: "Use with spacer, rinse mouth after use"
      },
      {
        id: "MED-06",
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Thrice daily (1-1-1)",
        duration: "5 days",
        quantity: 15,
        instructions: "Complete entire antibiotic course"
      }
    ],
    medicine: "Salbutamol Inhaler, Amoxicillin",
    medicineQuantity: 17,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-10",
    nextVisit: "2026-08-20",
    status: "Critical"
  },
  {
    id: "P1004",
    name: "Meena Patel",
    dob: "1995-02-18",
    age: 31,
    gender: "Female",
    bloodGroup: "AB+",
    phone: "9845678903",
    email: "meena.patel@email.com",
    address: "Navsar Village, Anand, Gujarat",
    emergencyContact: "Kiran Patel - 9845678904",
    disease: "Malaria & Fever",
    medicines: [
      {
        id: "MED-07",
        name: "Chloroquine",
        dosage: "250mg",
        frequency: "Twice daily (1-0-1)",
        duration: "3 days",
        quantity: 6,
        instructions: "Take after substantial meal"
      },
      {
        id: "MED-08",
        name: "Paracetamol",
        dosage: "650mg",
        frequency: "SOS for fever (max 3/day)",
        duration: "5 days",
        quantity: 10,
        instructions: "Keep 6 hours gap between doses"
      }
    ],
    medicine: "Chloroquine, Paracetamol",
    medicineQuantity: 16,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-12",
    nextVisit: "2026-08-22",
    status: "Active"
  },
  {
    id: "P1005",
    name: "Gopal Prasad",
    dob: "1952-07-30",
    age: 74,
    gender: "Male",
    bloodGroup: "O-",
    phone: "9856789014",
    email: "gopal.prasad@email.com",
    address: "Village Sonpur, Saran, Bihar",
    emergencyContact: "Amit Prasad - 9856789015",
    disease: "Coronary Artery Disease & Cholesterol",
    medicines: [
      {
        id: "MED-09",
        name: "Atorvastatin",
        dosage: "20mg",
        frequency: "Once daily (Bedtime)",
        duration: "45 days",
        quantity: 45,
        instructions: "Take at bedtime regularly"
      },
      {
        id: "MED-10",
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily (Morning)",
        duration: "45 days",
        quantity: 45,
        instructions: "Monitor blood pressure weekly"
      }
    ],
    medicine: "Atorvastatin, Amlodipine",
    medicineQuantity: 90,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-05",
    nextVisit: "2026-11-05",
    status: "Under Observation"
  },
  {
    id: "P1006",
    name: "Kiran Devi",
    dob: "1982-12-14",
    age: 43,
    gender: "Female",
    bloodGroup: "B-",
    phone: "9867890125",
    email: "kiran.devi@email.com",
    address: "Village Raipur, Sonbhadra, UP",
    emergencyContact: "Sanjay Kumar - 9867890126",
    disease: "Hypothyroidism",
    medicines: [
      {
        id: "MED-11",
        name: "Levothyroxine",
        dosage: "50mcg",
        frequency: "Once daily (Empty Stomach)",
        duration: "90 days",
        quantity: 90,
        instructions: "Take early morning on empty stomach 30 mins before tea/breakfast"
      }
    ],
    medicine: "Levothyroxine",
    medicineQuantity: 90,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-06-15",
    nextVisit: "2026-09-15",
    status: "Recovered"
  },
  {
    id: "P1007",
    name: "Hariharan S.",
    dob: "1990-05-22",
    age: 36,
    gender: "Male",
    bloodGroup: "A-",
    phone: "9878901236",
    email: "hari.s@email.com",
    address: "Village Melur, Madurai, Tamil Nadu",
    emergencyContact: "Anitha S. - 9878901237",
    disease: "Gastroenteritis & Dehydration",
    medicines: [
      {
        id: "MED-12",
        name: "ORS & Zinc Tablets",
        dosage: "1 sachet + 20mg Zinc",
        frequency: "After every loose stool",
        duration: "5 days",
        quantity: 10,
        instructions: "Dissolve 1 ORS sachet in 1 liter clean drinking water"
      },
      {
        id: "MED-13",
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "As needed for cramps/fever",
        duration: "3 days",
        quantity: 6,
        instructions: "Take with water after food"
      }
    ],
    medicine: "ORS & Zinc Tablets, Paracetamol",
    medicineQuantity: 16,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-13",
    nextVisit: "2026-08-18",
    status: "Active"
  },
  {
    id: "P1008",
    name: "Radha Bai",
    dob: "1948-10-10",
    age: 77,
    gender: "Female",
    bloodGroup: "AB-",
    phone: "9889012347",
    email: "radha.bai@email.com",
    address: "Village Khed, Pune, Maharashtra",
    emergencyContact: "Tukaram Bai - 9889012348",
    disease: "Osteoarthritis & Joint Pain",
    medicines: [
      {
        id: "MED-14",
        name: "Glucosamine",
        dosage: "750mg",
        frequency: "Twice daily (1-0-1)",
        duration: "30 days",
        quantity: 60,
        instructions: "Take with milk or meal"
      },
      {
        id: "MED-15",
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "Once daily (Night / SOS)",
        duration: "10 days",
        quantity: 10,
        instructions: "Take when severe joint discomfort occurs"
      }
    ],
    medicine: "Glucosamine, Paracetamol",
    medicineQuantity: 70,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-07-20",
    nextVisit: "2026-10-20",
    status: "Under Observation"
  },
  {
    id: "P1009",
    name: "Sanjay Oraon",
    dob: "2001-08-05",
    age: 25,
    gender: "Male",
    bloodGroup: "O+",
    phone: "9890123458",
    email: "sanjay.oraon@email.com",
    address: "Village Ormanjhi, Ranchi, Jharkhand",
    emergencyContact: "Birsa Oraon - 9890123459",
    disease: "Tuberculosis (DOTS Treatment)",
    medicines: [
      {
        id: "MED-16",
        name: "Rifampicin",
        dosage: "450mg",
        frequency: "Once daily (Morning, fasting)",
        duration: "60 days",
        quantity: 60,
        instructions: "Take strictly on empty stomach with water"
      },
      {
        id: "MED-17",
        name: "Iron Supplements",
        dosage: "100mg",
        frequency: "Once daily (Post-lunch)",
        duration: "60 days",
        quantity: 60,
        instructions: "Take after lunch with citrus fruit juice"
      }
    ],
    medicine: "Rifampicin, Iron Supplements",
    medicineQuantity: 120,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-02",
    nextVisit: "2026-08-30",
    status: "Active"
  },
  {
    id: "P1010",
    name: "Lalitha Prasad",
    dob: "1968-03-15",
    age: 58,
    gender: "Female",
    bloodGroup: "B+",
    phone: "9801234569",
    email: "lalitha.prasad@email.com",
    address: "Village Hunsur, Mysore, Karnataka",
    emergencyContact: "Narayana Prasad - 9801234560",
    disease: "Iron Deficiency Anemia",
    medicines: [
      {
        id: "MED-18",
        name: "Iron Supplements",
        dosage: "100mg",
        frequency: "Once daily (After Dinner)",
        duration: "30 days",
        quantity: 30,
        instructions: "Avoid tea or coffee 2 hours before/after taking"
      }
    ],
    medicine: "Iron Supplements",
    medicineQuantity: 30,
    doctor: "Dr. Sarah Paul",
    lastVisit: "2026-08-11",
    nextVisit: "2026-09-11",
    status: "Recovered"
  }
];

export const mockMedicines = [
  {
    id: "M2001",
    name: "Metformin",
    category: "Antidiabetic",
    description: "Used to control high blood sugar in patients with type 2 diabetes.",
    quantity: 150,
    minimumStock: 50,
    expiryDate: "2027-12-31",
    supplier: "RuralPharma Ltd."
  },
  {
    id: "M2002",
    name: "Amlodipine",
    category: "Antihypertensive",
    description: "Used to treat high blood pressure (hypertension) and prevent chest pain (angina).",
    quantity: 120,
    minimumStock: 40,
    expiryDate: "2027-06-30",
    supplier: "MedLife Distributors"
  },
  {
    id: "M2003",
    name: "Amoxicillin",
    category: "Antibiotic",
    description: "Antibiotic used to treat a wide variety of bacterial infections including chest and throat infections.",
    quantity: 0,
    minimumStock: 30,
    expiryDate: "2026-11-15",
    supplier: "Apex BioLabs"
  },
  {
    id: "M2004",
    name: "Salbutamol Inhaler",
    category: "Bronchodilator",
    description: "Used to quickly relieve breathing difficulties, wheezing, and chest tightness caused by asthma.",
    quantity: 8,
    minimumStock: 10,
    expiryDate: "2028-02-28",
    supplier: "BreatheEasy Solutions"
  },
  {
    id: "M2005",
    name: "Atorvastatin",
    category: "Cardiovascular",
    description: "Used along with a proper diet to lower 'bad' cholesterol and reduce the risk of heart complications.",
    quantity: 110,
    minimumStock: 30,
    expiryDate: "2027-09-30",
    supplier: "HeartCare Pharma"
  },
  {
    id: "M2006",
    name: "Levothyroxine",
    category: "Thyroid Hormone",
    description: "Used to treat hypothyroidism (underactive thyroid gland) to restore normal hormone levels.",
    quantity: 45,
    minimumStock: 40,
    expiryDate: "2027-05-15",
    supplier: "ThyroCorp Dist."
  },
  {
    id: "M2007",
    name: "Chloroquine",
    category: "Antimalarial",
    description: "Used to prevent and treat malaria caused by mosquito bites in rural sectors.",
    quantity: 5,
    minimumStock: 25,
    expiryDate: "2026-12-31",
    supplier: "TropicalCures Ltd."
  },
  {
    id: "M2008",
    name: "Iron Supplements",
    category: "Vitamin / Mineral",
    description: "Used to treat or prevent low blood levels of iron and manage iron-deficiency anemia.",
    quantity: 200,
    minimumStock: 50,
    expiryDate: "2028-08-31",
    supplier: "NutriHealth India"
  },
  {
    id: "M2009",
    name: "Rifampicin",
    category: "Anti-tuberculosis",
    description: "Antibiotic used with other medications to treat tuberculosis (TB) and serious bacterial infections.",
    quantity: 80,
    minimumStock: 40,
    expiryDate: "2027-03-20",
    supplier: "GlobalTB Aid"
  },
  {
    id: "M2010",
    name: "Paracetamol",
    category: "Analgesic / Antipyretic",
    description: "Used to reduce fever and relieve mild to moderate pain like headaches, body aches, and fever.",
    quantity: 12,
    minimumStock: 100,
    expiryDate: "2027-10-10",
    supplier: "MediLine Distributors"
  }
];

export const mockAlerts = [
  // Disease Alerts
  {
    id: "A3001",
    title: "Seasonal Malaria Outbreak Warning",
    description: "Disease Outbreak: 18 confirmed and suspected Malaria cases reported across Anand rural cluster in past 48 hours.",
    message: "Disease Outbreak: 18 confirmed and suspected Malaria cases reported across Anand rural cluster in past 48 hours.",
    type: "Critical",
    severity: "Critical",
    category: "disease",
    date: "2026-08-14 10:30",
    role: "doctor"
  },
  {
    id: "A3002",
    title: "High Disease Trend - Viral Respiratory Infections",
    description: "Disease Trend: Acute respiratory infections and asthma exacerbations increased by 34% in Purulia district.",
    message: "Disease Trend: Acute respiratory infections and asthma exacerbations increased by 34% in Purulia district.",
    type: "Warning",
    severity: "Warning",
    category: "disease",
    date: "2026-08-14 09:15",
    role: "doctor"
  },
  {
    id: "A3003",
    title: "Critical Patient Condition - Anil Singh",
    description: "Patient Anil Singh (P1003) is marked Critical with Chronic Asthma and acute Bronchospasm.",
    message: "Patient Anil Singh (P1003) is marked Critical with Chronic Asthma and acute Bronchospasm.",
    type: "Critical",
    severity: "Critical",
    category: "disease",
    date: "2026-08-14 09:45",
    role: "hospitalStaff"
  },
  {
    id: "A3004",
    title: "Hypertension & Cardiac Follow-up Required",
    description: "Patient Ramesh Kumar (P1001) is overdue for monthly Stage 2 Hypertension assessment.",
    message: "Patient Ramesh Kumar (P1001) is overdue for monthly Stage 2 Hypertension assessment.",
    type: "Warning",
    severity: "Warning",
    category: "disease",
    date: "2026-08-14 08:30",
    role: "doctor"
  },
  {
    id: "A3005",
    title: "Tuberculosis DOTS Surveillance Update",
    description: "Patient Sanjay Oraon (P1009) successfully completed intensive phase DOTS therapy with stable vitals.",
    message: "Patient Sanjay Oraon (P1009) successfully completed intensive phase DOTS therapy with stable vitals.",
    type: "Info",
    severity: "Info",
    category: "disease",
    date: "2026-08-13 14:20",
    role: "hospitalStaff"
  },

  // Medicine Alerts
  {
    id: "A3006",
    title: "Amoxicillin Out of Stock",
    description: "Medicine Alert: Amoxicillin 500mg is completely OUT OF STOCK (0 units available). Immediate reorder required.",
    message: "Medicine Alert: Amoxicillin 500mg is completely OUT OF STOCK (0 units available). Immediate reorder required.",
    type: "Critical",
    severity: "Critical",
    category: "medicine",
    date: "2026-08-14 08:00",
    role: "pharmacist"
  },
  {
    id: "A3007",
    title: "Chloroquine Low Stock Alert",
    description: "Medicine Alert: Chloroquine 250mg is critically low (5 units remaining, minimum threshold: 25 units).",
    message: "Medicine Alert: Chloroquine 250mg is critically low (5 units remaining, minimum threshold: 25 units).",
    type: "Critical",
    severity: "Critical",
    category: "medicine",
    date: "2026-08-14 08:15",
    role: "pharmacist"
  },
  {
    id: "A3008",
    title: "Salbutamol Inhaler Stock Warning",
    description: "Medicine Alert: Salbutamol Inhaler stock has dropped below minimum threshold (8 remaining, minimum: 10).",
    message: "Medicine Alert: Salbutamol Inhaler stock has dropped below minimum threshold (8 remaining, minimum: 10).",
    type: "Warning",
    severity: "Warning",
    category: "medicine",
    date: "2026-08-14 08:30",
    role: "pharmacist"
  },
  {
    id: "A3009",
    title: "Paracetamol Buffer Stock Low",
    description: "Medicine Alert: Paracetamol 650mg buffer stock is low (12 units remaining, minimum required: 100 units).",
    message: "Medicine Alert: Paracetamol 650mg buffer stock is low (12 units remaining, minimum required: 100 units).",
    type: "Warning",
    severity: "Warning",
    category: "medicine",
    date: "2026-08-14 08:45",
    role: "pharmacist"
  },
  {
    id: "A3010",
    title: "Medicine Expiry Notice - Batch #AMX-2026",
    description: "Medicine Alert: Amoxicillin Batch #AMX-2026 reaches expiration date on 2026-11-15. Review stock rotation.",
    message: "Medicine Alert: Amoxicillin Batch #AMX-2026 reaches expiration date on 2026-11-15. Review stock rotation.",
    type: "Warning",
    severity: "Warning",
    category: "medicine",
    date: "2026-08-13 11:10",
    role: "pharmacist"
  }
];
