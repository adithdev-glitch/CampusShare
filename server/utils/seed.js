const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Transaction = require('../models/Transaction');
const BorrowRequest = require('../models/BorrowRequest');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const dotenv = require('dotenv');

dotenv.config();

const departments = ['CSE', 'ECE', 'EEE', 'Mechanical', 'IT', 'Civil'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const conditions = ['Excellent', 'Good', 'Fair', 'Needs Repair'];

const studentNames = [
  'Aarav Sharma', 'Aditya Verma', 'Amit Patel', 'Ananya Iyer', 'Divya Nair',
  'Ishaan Gupta', 'Karan Malhotra', 'Neha Joshi', 'Rahul Krishnan', 'Rohan Das',
  'Sanjana Sen', 'Siddharth Rao', 'Sneha Reddy', 'Vijay Kumar', 'Admin User'
];

const mockResources = [
  // Electronics
  { name: 'Arduino UNO R3 Starter Kit', category: 'Electronics', condition: 'Excellent', description: 'Complete kit with breadboard, cables, LEDs, and basic sensors for mini projects.', tags: ['arduino', 'microcontroller', 'sensors', 'project'], location: 'CSE Lab block B', maxBorrowDuration: 10, accessories: ['USB Cable', 'Breadboard', 'Jumper Wires'], suitableFor: ['IoT Projects', 'Robotics', 'Mini Projects'] },
  { name: 'Raspberry Pi 4 Model B (4GB)', category: 'Electronics', condition: 'Excellent', description: 'Raspberry Pi 4 with heat sinks and case. Perfect for IoT projects or light server tasks.', tags: ['raspberry pi', 'computer', 'iot'], location: 'ECE Lab Room 302', maxBorrowDuration: 14, accessories: ['Power Adapter', 'Micro HDMI Cable', 'SD Card 32GB'], suitableFor: ['IoT Projects', 'Python Dev', 'Mini Projects'] },
  { name: 'NodeMCU ESP8266 WiFi Board', category: 'Electronics', condition: 'Good', description: 'WiFi-enabled microcontroller board. Ideal for home automation and basic cloud communication projects.', tags: ['esp8266', 'wifi', 'iot'], location: 'IT Dept Staff Room', maxBorrowDuration: 7, accessories: ['Micro USB Cable'], suitableFor: ['IoT Projects', 'Wireless Dev'] },
  { name: 'Digital Multimeter', category: 'Electronics', condition: 'Good', description: 'Handheld digital multimeter for testing voltage, current, and resistance. Manual range selector.', tags: ['multimeter', 'tester', 'electronics'], location: 'EEE Power Systems Lab', maxBorrowDuration: 5, accessories: ['Probes'], suitableFor: ['Testing', 'Hardware Debugging'] },
  { name: 'Soldering Iron Kit (60W)', category: 'Electronics', condition: 'Good', description: 'Adjustable temperature soldering iron with stand, solder wire, and desoldering pump.', tags: ['soldering', 'iron', 'soldering kit'], location: 'Mech Workshop Lab A', maxBorrowDuration: 4, accessories: ['Stand', 'Solder Wire', 'Sponge'], suitableFor: ['Soldering', 'Custom PCB assembly'] },
  
  // Project Kits
  { name: 'Line Follower Robot Kit', category: 'Project Kits', condition: 'Good', description: 'Chassis with dual motors, IR sensors, and motor driver board. Ready to plug in your controller.', tags: ['robotics', 'line follower', 'motors'], location: 'ECE Lab Block A', maxBorrowDuration: 10, accessories: ['Chassis', 'IR Sensors', 'Motor Driver'], suitableFor: ['Robotics', 'Control Algorithms'] },
  { name: 'Smart Home Automation Kit', category: 'Project Kits', condition: 'Excellent', description: 'Relay board, temperature sensors, and gas sensor for constructing an IoT home prototype.', tags: ['smarthome', 'sensors', 'relays'], location: 'IT Lab 2', maxBorrowDuration: 14, accessories: ['Relay board', 'DHT11 sensor', 'MQ-2 Gas sensor'], suitableFor: ['IoT Projects', 'Automation'] },
  { name: 'Obstacle Avoidance Car Kit', category: 'Project Kits', condition: 'Good', description: 'Ultrasonic sensor and servo-equipped car chassis for obstacle avoidance projects.', tags: ['robot', 'car', 'ultrasonic'], location: 'Mechanical Dept CAD Lab', maxBorrowDuration: 7, accessories: ['Servo Motor', 'Ultrasonic sensor', 'Battery holder'], suitableFor: ['Robotics', 'Path planning'] },

  // Lab Equipment
  { name: 'Analog Oscilloscope Probes', category: 'Lab Equipment', condition: 'Fair', description: 'Standard BNC oscilloscope probes with 10x/1x attenuation switches.', tags: ['probes', 'oscilloscope', 'measuring'], location: 'EEE Signals Lab', maxBorrowDuration: 5, accessories: ['Ground clips', 'Color rings'], suitableFor: ['Signal analysis'] },
  { name: 'Vernier Caliper (Stainless Steel)', category: 'Lab Equipment', condition: 'Excellent', description: 'High precision manual caliper for measuring internal, external, and depth metrics up to 150mm.', tags: ['vernier', 'caliper', 'measurement'], location: 'Mech Dept Workshop B', maxBorrowDuration: 3, accessories: ['Storage Case'], suitableFor: ['Engineering drawings', 'Mechanical Design'] },
  
  // Books
  { name: 'Introduction to Algorithms (CLRS)', category: 'Books', condition: 'Good', description: 'Third Edition. Comprehensive reference guide for algorithmic designs and analysis.', tags: ['clrs', 'algorithms', 'cs textbook'], location: 'CSE Library Block C', maxBorrowDuration: 15, accessories: [], suitableFor: ['Data Structures', 'Competitive Coding'] },
  { name: 'Computer Networking: A Top-Down Approach', category: 'Books', condition: 'Good', description: 'Sixth Edition by Kurose & Ross. Standard curriculum book for networking systems.', tags: ['networking', 'textbook', 'internet'], location: 'IT Library Block D', maxBorrowDuration: 15, accessories: [], suitableFor: ['Networking', 'Internet Protocols'] },
  { name: 'Advanced Engineering Mathematics', category: 'Books', condition: 'Fair', description: 'Kreyszig textbook. Great for learning Fourier series, calculus, and matrix algebra.', tags: ['maths', 'engineering maths', 'textbook'], location: 'Hostel Block A Lounge', maxBorrowDuration: 20, accessories: [], suitableFor: ['Engineering Maths', 'Semester Prep'] },
  
  // Calculators
  { name: 'Casio fx-991ES Plus Scientific Calculator', category: 'Calculators', condition: 'Excellent', description: 'Standard engineering calculator with matrix, vector, complex numbers, and equation solvers.', tags: ['casio', 'calculator', 'exams'], location: 'Hostel Block B Room 102', maxBorrowDuration: 7, accessories: ['Slide Case'], suitableFor: ['Calculations', 'Semester Exams'] },
  { name: 'Casio fx-82MS Calculator', category: 'Calculators', condition: 'Good', description: 'Basic scientific calculator. Handheld, battery-operated, covers standard trigonometry.', tags: ['casio', 'calculator'], location: 'EEE Dept Main Office', maxBorrowDuration: 7, accessories: ['Cover'], suitableFor: ['Calculations'] },

  // Computer Accessories
  { name: 'Logitech Wireless Mouse M170', category: 'Computer Accessories', condition: 'Good', description: 'Compact wireless mouse with USB nano receiver. Battery included.', tags: ['mouse', 'wireless', 'logitech'], location: 'CSE Lab 4', maxBorrowDuration: 7, accessories: ['USB Receiver'], suitableFor: ['Daily laptop use'] },
  { name: 'Laptop Cooling Pad (Dual Fans)', category: 'Computer Accessories', condition: 'Good', description: 'USB-powered cooling pad with blue LED lighting. Fits laptops up to 15.6 inches.', tags: ['cooler', 'cooling pad', 'laptop'], location: 'Hostel Block C Room 304', maxBorrowDuration: 10, accessories: ['USB Cable'], suitableFor: ['Heavy programming', 'Gaming'] },
  { name: 'USB-C to HDMI Multi-Port Adapter', category: 'Computer Accessories', condition: 'Excellent', description: 'Aluminum hub with HDMI, USB 3.0, and USB-C pass-through charging.', tags: ['adapter', 'hub', 'hdmi'], location: 'IT Lab Block E', maxBorrowDuration: 5, accessories: [], suitableFor: ['Lab Presentations', 'Dual monitors'] },

  // Hostel Essentials (Electric Kettle, Iron Box, Power Bank, etc.)
  { name: 'Pigeon Electric Kettle (1.5L)', category: 'Hostel Essentials', condition: 'Excellent', description: 'Stainless steel electric kettle for boiling water, milk, or preparing instant noodles.', tags: ['kettle', 'hostel', 'water heater'], location: 'Hostel Block B Room 304', maxBorrowDuration: 7, accessories: ['Heating Base'], suitableFor: ['Hot Water', 'Maggi'] },
  { name: 'Philips Dry Iron Box (1000W)', category: 'Hostel Essentials', condition: 'Good', description: 'Lightweight dry iron box with non-stick soleplate and thermostatic temperature selector.', tags: ['iron', 'iron box', 'clothes'], location: 'Hostel Block A Room 205', maxBorrowDuration: 3, accessories: [], suitableFor: ['Ironing Clothes', 'Viva/Interview Prep'] },
  { name: 'Mi 20000mAh Power Bank', category: 'Hostel Essentials', condition: 'Excellent', description: 'High-capacity power bank with dual USB outputs and fast charging support.', tags: ['power bank', 'charger', 'battery'], location: 'Hostel Block C Room 104', maxBorrowDuration: 4, accessories: ['Micro-USB Cable'], suitableFor: ['Travel', 'Power cuts'] },
  { name: 'Philips Hair Dryer (1200W)', category: 'Hostel Essentials', condition: 'Good', description: 'Compact hair dryer with foldable handle and 2 flexible speed configurations.', tags: ['hair dryer', 'hostel'], location: 'Hostel Block D Room 402', maxBorrowDuration: 2, accessories: [], suitableFor: ['Hair drying'] },
  { name: 'Syska 4-Socket Extension Board', category: 'Hostel Essentials', condition: 'Excellent', description: 'Extension board with surge protector and 2.5-meter cord. 4 outlets with individual switches.', tags: ['extension', 'socket', 'plug'], location: 'Hostel Block B Room 210', maxBorrowDuration: 15, accessories: [], suitableFor: ['Power outlets'] },
  { name: 'Wipro Smart LED Study Lamp', category: 'Hostel Essentials', condition: 'Good', description: 'Rechargeable LED desk study lamp with 3 color temperatures and touch control dimming.', tags: ['lamp', 'study', 'light'], location: 'Hostel Block A Room 411', maxBorrowDuration: 10, accessories: ['Charging Adapter'], suitableFor: ['Late night study'] },
  { name: 'Usha Table Fan (High Speed)', category: 'Hostel Essentials', condition: 'Good', description: 'Portable tabletop fan. Offers strong airflow for humid afternoons.', tags: ['fan', 'table fan', 'cooler'], location: 'Hostel Block C Room 201', maxBorrowDuration: 14, accessories: [], suitableFor: ['Hostel room cooling'] },
  { name: 'Wildcraft Umbrella', category: 'Hostel Essentials', condition: 'Good', description: 'Sturdy black three-fold umbrella. Easy to fit in college backpack.', tags: ['umbrella', 'rain'], location: 'Hostel Block A Gate', maxBorrowDuration: 3, accessories: [], suitableFor: ['Rain protection'] },

  // Sports Equipment
  { name: 'Yonex Muscle Power 29 Badminton Racket', category: 'Sports Equipment', condition: 'Good', description: 'Full graphite badminton racket. Strung, lightweight, and responsive.', tags: ['yonex', 'badminton', 'racket', 'sports'], location: 'Campus Sports Ground', maxBorrowDuration: 4, accessories: ['Racket Cover'], suitableFor: ['Evening matches'] },
  { name: 'Nivia Shuttlecocks (Tube of 6)', category: 'Sports Equipment', condition: 'Good', description: 'Nylon shuttlecocks. Strung and balanced for recreational matches.', tags: ['shuttle', 'badminton', 'sports'], location: 'Hostel Block A Room 102', maxBorrowDuration: 4, accessories: [], suitableFor: ['Badminton'] },
  { name: 'Nivia Encounter Football (Size 5)', category: 'Sports Equipment', condition: 'Fair', description: 'Standard hand-stitched soccer ball. Inflated, good grip for muddy fields.', tags: ['football', 'soccer', 'sports'], location: 'Main Football Field', maxBorrowDuration: 5, accessories: ['Pump pin'], suitableFor: ['Football practice'] },
  { name: 'Monopoly Board Game', category: 'Sports Equipment', condition: 'Good', description: 'Ultimate board game for weekend fun. Includes board, cards, money, and tokens.', tags: ['monopoly', 'board game', 'fun'], location: 'Hostel Block D Recreation Room', maxBorrowDuration: 4, accessories: ['Tokens', 'Cards', 'Dice', 'Play Money'], suitableFor: ['Weekend hostel groups'] }
];

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus_resource_exchange');
    console.log('Connected.');

    // Clear all previous data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Transaction.deleteMany({});
    await BorrowRequest.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('Collections cleared.');

    // Create 15 Students
    console.log('Creating 15 student records...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    const userPromises = studentNames.map((name, index) => {
      const email = name.toLowerCase().replace(' ', '.') + '@college.edu';
      const registerNumber = `RA2211003010${String(index + 1).padStart(3, '0')}`;
      const department = departments[index % departments.length];
      const year = years[index % years.length];
      
      // Make Admin User the admin
      const role = name === 'Admin User' ? 'admin' : 'student';

      return User.create({
        name,
        email,
        registerNumber,
        department,
        year,
        password: 'password123', // hooks will trigger pre-save, but we can set directly since it hooks
        role,
        rating: 4.5 + (index % 5) * 0.1, // ratings: 4.5 to 4.9
        profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        isVerified: true
      });
    });

    const students = await Promise.all(userPromises);
    console.log(`Created ${students.length} students.`);

    // Map students for quick reference
    const nonAdminStudents = students.filter(s => s.role !== 'admin');

    const getResourceImage = (name, category) => {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('arduino')) {
        return 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('raspberry')) {
        return 'https://images.unsplash.com/photo-1517055720730-0766be088582?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('multimeter')) {
        return 'https://images.unsplash.com/photo-1581092334651-ddf26d9a1930?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('soldering')) {
        return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('esp8266')) {
        return 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('robot') || nameLower.includes('car')) {
        return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('oscilloscope')) {
        return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('caliper')) {
        return 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('python') || nameLower.includes('programming')) {
        return 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('chemistry') || nameLower.includes('lab')) {
        return 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('casio') || nameLower.includes('calculator')) {
        return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('keyboard')) {
        return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('cooling')) {
        return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('kettle')) {
        return 'https://images.unsplash.com/photo-1594213110823-113c69346cb5?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('lamp') || nameLower.includes('light')) {
        return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('racket') || nameLower.includes('badminton')) {
        return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600';
      }
      if (nameLower.includes('basketball')) {
        return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600';
      }

      const categoryImages = {
        'Electronics': 'https://images.unsplash.com/photo-1553406830-ef251367588c?auto=format&fit=crop&q=80&w=600',
        'Project Kits': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
        'Lab Equipment': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
        'Books': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
        'Calculators': 'https://images.unsplash.com/photo-1574607383476-f517f220d398?auto=format&fit=crop&q=80&w=600',
        'Computer Accessories': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
        'Hostel Essentials': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
        'Sports Equipment': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600'
      };

      return categoryImages[category] || 'https://images.unsplash.com/photo-1517055720730-0766be088582?auto=format&fit=crop&q=80&w=600';
    };

    // Create 30 Resources
    console.log('Creating 30 resource records...');
    const resourcePromises = mockResources.map((res, index) => {
      // Rotate owner student
      const owner = nonAdminStudents[index % nonAdminStudents.length];
      return Resource.create({
        ...res,
        ownerId: owner._id,
        availability: index % 6 !== 0, // Make a few resources unavailable (every 6th item)
        department: owner.department,
        images: [getResourceImage(res.name, res.category)]
      });
    });

    const resources = await Promise.all(resourcePromises);
    console.log(`Created ${resources.length} resources.`);

    // Create 10 Borrow Requests & 10 Transactions
    console.log('Creating mock borrowings & transactions...');
    
    // Pick some resources that are currently set to unavailable to act as active borrowings
    const unavailableResources = resources.filter(r => !r.availability);
    
    // Let's create transactions for these unavailable resources
    const transactionPromises = [];
    const reviewPromises = [];
    const borrowRequestPromises = [];

    // Create 5 active "borrowed" transactions
    for (let i = 0; i < 5 && i < unavailableResources.length; i++) {
      const resource = unavailableResources[i];
      // Find a borrower who is NOT the owner
      const borrower = nonAdminStudents.find(s => s._id.toString() !== resource.ownerId.toString());

      transactionPromises.push(Transaction.create({
        resourceId: resource._id,
        borrowerId: borrower._id,
        ownerId: resource.ownerId,
        status: 'borrowed',
        pickupTime: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)), // 3 days ago
        qrCode: `pickup_token_${i}_${Date.now()}`,
        conditionBefore: resource.condition
      }));
    }

    // Create 3 "completed" transactions (returned)
    // Find some available resources to mark as previously borrowed/returned
    const availableResources = resources.filter(r => r.availability);
    for (let i = 0; i < 3 && i < availableResources.length; i++) {
      const resource = availableResources[i];
      const borrower = nonAdminStudents.find(s => s._id.toString() !== resource.ownerId.toString());

      transactionPromises.push(Transaction.create({
        resourceId: resource._id,
        borrowerId: borrower._id,
        ownerId: resource.ownerId,
        status: 'returned',
        pickupTime: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
        returnTime: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
        qrCode: `completed_token_${i}_${Date.now()}`,
        conditionBefore: 'Good',
        conditionAfter: 'Good'
      }));
    }

    // Create 2 "overdue" transactions
    for (let i = 0; i < 2 && i < unavailableResources.length; i++) {
      const resource = unavailableResources[unavailableResources.length - 1 - i]; // pick from end
      const borrower = nonAdminStudents.find(s => s._id.toString() !== resource.ownerId.toString());

      transactionPromises.push(Transaction.create({
        resourceId: resource._id,
        borrowerId: borrower._id,
        ownerId: resource.ownerId,
        status: 'overdue',
        pickupTime: new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)), // 12 days ago (longer than standard 7 days)
        qrCode: `overdue_token_${i}_${Date.now()}`,
        conditionBefore: resource.condition
      }));
    }

    const transactions = await Promise.all(transactionPromises);
    console.log(`Created ${transactions.length} transactions.`);

    // Create 10 Reviews (linked to completed transactions or general reviews)
    console.log('Seeding reviews...');
    const completedTransactions = transactions.filter(t => t.status === 'returned');
    
    for (let i = 0; i < completedTransactions.length; i++) {
      const tx = completedTransactions[i];
      
      // Borrower rates Owner
      reviewPromises.push(Review.create({
        reviewerId: tx.borrowerId,
        reviewedUserId: tx.ownerId,
        transactionId: tx._id,
        rating: 5,
        comment: 'Resource was in excellent condition and owner was super helpful!'
      }));

      // Owner rates Borrower
      reviewPromises.push(Review.create({
        reviewerId: tx.ownerId,
        reviewedUserId: tx.borrowerId,
        transactionId: tx._id,
        rating: 4,
        comment: 'Returned the item on time. Safe usage and good communication.'
      }));
    }

    // Add some general reviews to cover 10 reviews
    const genericLenders = nonAdminStudents.slice(0, 2);
    const genericBorrowers = nonAdminStudents.slice(3, 5);
    for (let i = 0; i < 4; i++) {
      const randomTx = transactions[i % transactions.length];
      reviewPromises.push(Review.create({
        reviewerId: genericBorrowers[i % 2]._id,
        reviewedUserId: genericLenders[i % 2]._id,
        transactionId: randomTx._id,
        rating: 5 - (i % 2),
        comment: i % 2 === 0 
          ? 'Great lending experience, the item worked perfectly for my course project.' 
          : 'Hassle free coordination. Item was clean.'
      }));
    }

    const reviews = await Promise.all(reviewPromises);
    console.log(`Created ${reviews.length} reviews.`);

    // Create 5 pending borrow requests
    console.log('Seeding pending borrow requests...');
    const openResources = resources.filter(r => r.availability);
    for (let i = 0; i < 5 && i < openResources.length; i++) {
      const res = openResources[i];
      const requester = nonAdminStudents.find(s => s._id.toString() !== res.ownerId.toString());

      borrowRequestPromises.push(BorrowRequest.create({
        resourceId: res._id,
        borrowerId: requester._id,
        ownerId: res.ownerId,
        expectedReturnDate: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
        purpose: 'Required for ECE course mini-project submission coming up next week.',
        message: 'Hello! I need to use this for testing my code implementation. I will handle it with care and return promptly. Thanks!',
        status: 'pending'
      }));

      // Send notification
      await Notification.create({
        userId: res.ownerId,
        type: 'request',
        message: `${requester.name} requested to borrow your "${res.name}".`
      });
    }

    const borrowRequests = await Promise.all(borrowRequestPromises);
    console.log(`Created ${borrowRequests.length} pending borrow requests.`);

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
