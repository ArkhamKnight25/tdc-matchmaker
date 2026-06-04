// Seeded profile generator — fixed seed for reproducibility
// Run: node scripts/generate-profiles.js
// Outputs: src/data/pool-profiles.json

const fs = require('fs');
const path = require('path');

// Deterministic seeded RNG (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const femaleFirstNames = [
  'Priya','Ananya','Kavya','Shreya','Divya','Nisha','Pooja','Riya','Sneha','Meera',
  'Aisha','Sunita','Rekha','Deepa','Lakshmi','Archana','Swati','Asha','Geeta','Sonal',
  'Neha','Preeti','Jyoti','Sakshi','Aditi','Simran','Komal','Varsha','Shalini','Pallavi',
  'Tanvi','Vidya','Bhavna','Rashmi','Anjali','Manisha','Shweta','Puja','Aarti','Nandini',
  'Rohini','Tanya','Khushi','Sonam','Prachi','Yamini','Rupa','Hema','Sudha','Mala',
  'Lalita','Kavita','Sarita','Kiran','Sujatha','Meghna','Chandni','Ridhi','Ishita','Sonia'
];

const maleFirstNames = [
  'Rahul','Arjun','Vikram','Siddharth','Rohit','Aditya','Kartik','Manish','Rajesh','Suresh',
  'Vijay','Kiran','Deepak','Nikhil','Prashant','Abhishek','Vikas','Sandeep','Amit','Ravi',
  'Sunil','Manoj','Rajiv','Sanjay','Pankaj','Gaurav','Varun','Tarun','Ankit','Mohit',
  'Harsh','Vivek','Akash','Nitin','Sumit','Shubham','Aman','Dev','Yash','Kunal',
  'Ritesh','Sachin','Tushar','Girish','Pratik','Rohan','Naveen','Dinesh','Ramesh','Krishna'
];

const lastNames = [
  'Sharma','Verma','Gupta','Singh','Kumar','Patel','Shah','Mehta','Joshi','Iyer',
  'Nair','Reddy','Rao','Pillai','Menon','Chatterjee','Mukherjee','Das','Ghosh','Sen',
  'Agarwal','Bansal','Goel','Mittal','Arora','Kapoor','Malhotra','Chopra','Bhatia','Sethi',
  'Saxena','Srivastava','Mishra','Tiwari','Pandey','Dubey','Tripathi','Yadav','Chauhan','Thakur'
];

const cities = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad',
  'Jaipur','Surat','Lucknow','Chandigarh','Bhopal','Indore','Nagpur','Patna',
  'Vadodara','Coimbatore','Vizag','Kochi','Mysore','Gurgaon','Noida','Faridabad'
];

const colleges = [
  'IIT Bombay','IIT Delhi','IIT Madras','IIT Kharagpur','IIT Kanpur',
  'NIT Trichy','NIT Warangal','BITS Pilani','Delhi University','Mumbai University',
  'Pune University','VIT Vellore','Manipal University','Christ University','Symbiosis',
  'RVCE Bangalore','PES University','Jadavpur University','BHU Varanasi','Osmania University',
  'COEP Pune','DAIICT Gandhinagar','TIET Patiala','MAHE Manipal','SRM Institute'
];

const degrees = ['B.Tech','B.E.','B.Sc','BCA','B.Com','BA','BBA','B.Arch','MBBS','B.Pharm'];
const higherQual = ['MBA','M.Tech','M.Sc','MCA','MA','MS','PhD','MD','CA','CFA'];
const fields = ['Computer Science','Electronics','Mechanical','Civil','Finance','Marketing','Biology','Psychology','Commerce','Arts'];

const companies = [
  'TCS','Infosys','Wipro','HCL','Tech Mahindra','Cognizant','Accenture','IBM','Capgemini',
  'Amazon','Google','Microsoft','Flipkart','Ola','Paytm','Zomato','Swiggy','HDFC Bank',
  'ICICI Bank','SBI','Deloitte','EY','PwC','KPMG','McKinsey','BCG','L&T','Reliance','Tata'
];

const designations = [
  'Software Engineer','Senior Software Engineer','Product Manager','Data Scientist',
  'Business Analyst','Marketing Manager','HR Manager','Financial Analyst','Operations Manager',
  'Team Lead','Tech Lead','Associate','Consultant','Senior Consultant','Manager',
  'Senior Manager','Doctor','Teacher','Lawyer','Architect'
];

const incomeBands = ['3-5 LPA','5-8 LPA','8-12 LPA','12-18 LPA','18-25 LPA','25-40 LPA','40+ LPA'];
const religions = ['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Parsi'];
const castes = ['Brahmin','Kshatriya','Vaishya','Kayastha','Rajput','Maratha','Nair','Iyer','Iyengar','Lingayat','Vokkaliga','Gujjar','Jat','Khatri','Agarwal'];
const motherTongues = ['Hindi','Tamil','Telugu','Kannada','Malayalam','Bengali','Marathi','Gujarati','Punjabi','Urdu','Odia','Assamese'];
const languages = ['Hindi','English','Tamil','Telugu','Kannada','Malayalam','Bengali','Marathi','Gujarati','Punjabi'];
const hobbiesPool = ['Reading','Travelling','Cooking','Photography','Music','Dancing','Yoga','Fitness','Painting','Gaming','Cricket','Badminton','Swimming','Trekking','Movies','Theatre','Gardening','Writing'];
const fatherOccupations = ['Business','Government Service','Private Service','Retired','Doctor','Lawyer','Engineer','Teacher','Farmer','Self-Employed'];
const motherOccupations = ['Homemaker','Teacher','Doctor','Business','Government Service','Private Service','Retired','Self-Employed'];

function generateProfile(id, gender, seed_offset) {
  const isFemale = gender === 'Female';
  const firstName = isFemale ? femaleFirstNames[Math.floor(rand() * femaleFirstNames.length)] : maleFirstNames[Math.floor(rand() * maleFirstNames.length)];
  const lastName = pick(lastNames);
  const age = range(24, 40);
  const dob = new Date(2024 - age, range(0, 11), range(1, 28));
  const heightCm = isFemale ? range(152, 172) : range(162, 185);
  const religion = pick(religions);
  const hobbiesCount = range(2, 5);
  const hobbies = [];
  const hobbyPool = [...hobbiesPool];
  for (let i = 0; i < hobbiesCount; i++) {
    const idx = Math.floor(rand() * hobbyPool.length);
    hobbies.push(hobbyPool.splice(idx, 1)[0]);
  }
  const langCount = range(2, 4);
  const langs = ['English'];
  for (let i = 0; i < langCount - 1; i++) {
    const l = pick(languages);
    if (!langs.includes(l)) langs.push(l);
  }

  const expectations = [
    `Looking for someone who is family-oriented, well-educated, and shares similar values around work-life balance.`,
    `Prefer a partner who is independent, respectful, and emotionally mature. Career-focused individuals welcome.`,
    `Seeking someone who values both tradition and modernity. Open to different cultural backgrounds.`,
    `Want someone who is supportive, ambitious, and values deep conversations. Love for travel a plus.`,
    `Looking for a partner with a good sense of humour, stability, and family values. Faith-aligned preferred.`,
  ][Math.floor(rand() * 5)];

  return {
    id,
    firstName,
    lastName,
    gender,
    dateOfBirth: dob.toISOString().split('T')[0],
    age,
    height: heightCm,
    country: 'India',
    city: pick(cities),
    openToRelocate: pick(['Yes', 'No', 'Maybe']),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${range(10,99)}@example.com`,
    phone: `+91 ${range(7000000000, 9999999999)}`,
    undergraduateCollege: pick(colleges),
    degree: pick(degrees),
    fieldOfStudy: pick(fields),
    higherQualification: rand() > 0.4 ? pick(higherQual) : undefined,
    currentCompany: pick(companies),
    designation: pick(designations),
    incomeBand: pick(incomeBands),
    maritalStatus: rand() > 0.85 ? (rand() > 0.5 ? 'Divorced' : 'Separated') : 'Never Married',
    languagesKnown: langs,
    siblings: range(0, 3),
    religion,
    caste: rand() > 0.3 ? pick(castes) : undefined,
    subCaste: rand() > 0.7 ? 'General' : undefined,
    motherTongue: pick(motherTongues),
    manglik: pick(['Yes', 'No', "Doesn't Matter"]),
    diet: pick(['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', 'Jain']),
    familyType: pick(['Nuclear', 'Joint', 'Extended']),
    fatherOccupation: pick(fatherOccupations),
    motherOccupation: pick(motherOccupations),
    drinkingHabit: pick(['Never', 'Occasionally', 'Regularly']),
    smokingHabit: rand() > 0.4 ? 'Never' : pick(['Never', 'Occasionally', 'Regularly']),
    wantKids: pick(['Yes', 'No', 'Maybe']),
    openToPets: pick(['Yes', 'No', 'Maybe']),
    hobbies,
    partnerExpectations: expectations,
    nriStatus: rand() > 0.85 ? pick(['NRI', 'OCI', 'PIO']) : 'Indian Resident',
    physicalStatus: rand() > 0.95 ? 'Differently Abled' : 'No Disability',
  };
}

// Generate 60 female + 60 male pool profiles
const femaleProfiles = Array.from({ length: 60 }, (_, i) => generateProfile(`f${i + 1}`, 'Female', i));
const maleProfiles = Array.from({ length: 60 }, (_, i) => generateProfile(`m${i + 1}`, 'Male', i + 100));

const allProfiles = [...femaleProfiles, ...maleProfiles];

const outDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'pool-profiles.json'), JSON.stringify(allProfiles, null, 2));

console.log(`Generated ${allProfiles.length} profiles (${femaleProfiles.length} female, ${maleProfiles.length} male)`);
