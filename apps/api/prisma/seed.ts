import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Helper function untuk mendapatkan random item dari array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

// Helper function untuk mendapatkan random number dalam range
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - be careful in production!)
  console.log('🗑️  Clearing existing data...');
  await prisma.reportActivity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.disasterReport.deleteMany();
  await prisma.roadReport.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // CREATE USERS
  // ============================================
  console.log('👥 Creating users...');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '081234567890',
      role: 'admin',
      isActive: true,
    },
  });

  const petugas1 = await prisma.user.create({
    data: {
      name: 'Petugas Satu',
      email: 'petugas1@example.com',
      password: hashedPassword,
      phone: '081234567891',
      role: 'petugas',
      isActive: true,
    },
  });

  const petugas2 = await prisma.user.create({
    data: {
      name: 'Petugas Dua',
      email: 'petugas2@example.com',
      password: hashedPassword,
      phone: '081234567892',
      role: 'petugas',
      isActive: true,
    },
  });

  const petugas3 = await prisma.user.create({
    data: {
      name: 'Petugas Tiga',
      email: 'petugas3@example.com',
      password: hashedPassword,
      phone: '081234567893',
      role: 'petugas',
      isActive: true,
    },
  });

  // Create more users
  const userNames = [
    'John Doe',
    'Jane Smith',
    'Budi Santoso',
    'Siti Nurhaliza',
    'Ahmad Fauzi',
    'Dewi Lestari',
    'Rudi Hartono',
    'Maya Sari',
    'Bambang Wijaya',
    'Indah Permata',
    'Agus Setiawan',
    'Ratna Dewi',
  ];

  const users = [admin, petugas1, petugas2, petugas3];
  const petugas = [petugas1, petugas2, petugas3];

  for (let i = 0; i < userNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        name: userNames[i]!,
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        phone: `0812345678${String(i + 10).padStart(2, '0')}`,
        role: 'user',
        isActive: true,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users (1 admin, 3 petugas, ${userNames.length} users)`);

  // ============================================
  // IMAGE PATHS FROM UPLOADS/EXAMPLE
  // ============================================
  const floodImages = [
    '/uploads/examples/banjir _seatap.webp',
    '/uploads/examples/banjir-bejir.jpeg',
    '/uploads/examples/banjirbandang.jpeg',
  ];

  const fireImages = ['/uploads/examples/gambar-kebakaran.jpeg'];

  const roadImages = [
    '/uploads/examples/jalan rusak.jpeg',
    '/uploads/examples/jalan_berlubang_pasir.jpg',
    '/uploads/examples/jalan_rusak_banyak.webp',
    '/uploads/examples/jalan_sedikit_berlubang.jpeg',
    '/uploads/examples/jalan_seperti_kolam.webp',
    '/uploads/examples/jalan-baik.jpeg',
    '/uploads/examples/jalanrusak-terisolasi.jpeg',
    '/uploads/examples/jalan-rusak.jpeg',
    '/uploads/examples/sungai_dijalan.webp',
  ];

  // ============================================
  // CREATE DISASTER REPORTS
  // ============================================
  console.log('🌊 Creating disaster reports...');

  const disasterTemplates = [
    {
      type: 'flood' as const,
      titles: [
        'Banjir di Jalan Raya Sudirman',
        'Banjir Bandang di Perumahan',
        'Genangan Air di Kawasan Industri',
        'Banjir di Permukiman Padat',
        'Air Meluap di Jalan Raya',
        'Banjir di Area Komersial',
        'Genangan Tinggi di Perumahan',
        'Banjir Akibat Hujan Deras',
      ],
      descriptions: [
        'Banjir terjadi akibat hujan deras yang berlangsung selama 3 jam. Air mencapai ketinggian 50cm dan menggenangi beberapa rumah.',
        'Banjir bandang terjadi di kompleks perumahan akibat saluran drainase yang tersumbat.',
        'Genangan air tinggi di kawasan industri mengganggu aktivitas produksi.',
        'Banjir di permukiman padat penduduk, beberapa rumah terendam air setinggi 40cm.',
        'Air meluap dari saluran drainase dan menggenangi jalan raya.',
        'Banjir di area komersial menyebabkan beberapa toko terendam.',
        'Genangan air tinggi di perumahan, warga kesulitan keluar masuk rumah.',
        'Banjir terjadi akibat hujan deras yang berlangsung sepanjang malam.',
      ],
      districts: [
        'Jakarta Pusat',
        'Jakarta Selatan',
        'Jakarta Barat',
        'Jakarta Timur',
        'Jakarta Utara',
      ],
      addresses: [
        'Jalan Jenderal Sudirman No. 123',
        'Perumahan Taman Indah',
        'Kawasan Industri Cakung',
        'Permukiman Padat Karet',
        'Jalan Raya Bekasi',
        'Area Komersial Kemang',
        'Perumahan Bintaro',
        'Jalan Raya Cikarang',
      ],
      riskLevels: ['low', 'medium', 'high', 'critical'] as const,
      urgencyRange: { min: 20, max: 95 },
    },
    {
      type: 'fire' as const,
      titles: [
        'Kebakaran di Pasar Tradisional',
        'Kebakaran Gedung Perkantoran',
        'Kebakaran di Permukiman',
        'Kebakaran Lahan',
        'Kebakaran di Pabrik',
        'Kebakaran Rumah',
      ],
      descriptions: [
        'Kebakaran terjadi di pasar tradisional akibat korsleting listrik. Api sudah mulai menyebar ke beberapa kios.',
        'Kebakaran terjadi di gedung perkantoran, asap tebal terlihat dari lantai 5.',
        'Kebakaran terjadi di permukiman padat, beberapa rumah terbakar.',
        'Kebakaran lahan di area terbuka, asap tebal mengganggu visibilitas.',
        'Kebakaran terjadi di pabrik, tim pemadam kebakaran sedang menuju lokasi.',
        'Kebakaran terjadi di rumah warga, api sudah mulai menyebar ke rumah tetangga.',
      ],
      districts: ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
      addresses: [
        'Pasar Senen',
        'Gedung Perkantoran Sudirman',
        'Permukiman Karet',
        'Lahan Kosong Cakung',
        'Pabrik Cikarang',
        'Perumahan Bintaro',
      ],
      riskLevels: ['medium', 'high', 'critical'] as const,
      urgencyRange: { min: 60, max: 100 },
    },
    {
      type: 'fallen_tree' as const,
      titles: [
        'Pohon Tumbang Menutupi Jalan',
        'Pohon Besar Tumbang',
        'Batang Pohon Menghalangi Jalan',
        'Pohon Tumbang di Perumahan',
      ],
      descriptions: [
        'Pohon besar tumbang akibat angin kencang dan menutupi jalan raya. Lalu lintas terhambat.',
        'Pohon besar tumbang di pinggir jalan, menghalangi akses kendaraan.',
        'Batang pohon besar menghalangi jalan, perlu segera dibersihkan.',
        'Pohon tumbang di perumahan, menimpa pagar rumah warga.',
      ],
      districts: ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat'],
      addresses: [
        'Jalan Gatot Subroto',
        'Jalan Rasuna Said',
        'Jalan Kemang Raya',
        'Perumahan Bintaro',
      ],
      riskLevels: ['low', 'medium', 'high'] as const,
      urgencyRange: { min: 30, max: 70 },
    },
    {
      type: 'earthquake' as const,
      titles: ['Gempa Ringan di Jakarta', 'Gempa Terasa di Jakarta', 'Guncangan Gempa'],
      descriptions: [
        'Terjadi gempa ringan dengan skala 4.5 SR. Beberapa bangunan mengalami retakan ringan.',
        'Gempa terasa di Jakarta, warga panik keluar rumah.',
        'Guncangan gempa terasa selama beberapa detik.',
      ],
      districts: ['Jakarta Selatan', 'Jakarta Pusat'],
      addresses: ['Jakarta Selatan', 'Jakarta Pusat'],
      riskLevels: ['low', 'medium'] as const,
      urgencyRange: { min: 40, max: 70 },
    },
  ];

  const disasterReports = [];
  const statuses: Array<'pending' | 'verified' | 'in_progress' | 'resolved'> = [
    'pending',
    'verified',
    'in_progress',
    'resolved',
  ];

  // Create 25 disaster reports
  for (let i = 0; i < 25; i++) {
    const template = getRandomItem(disasterTemplates);
    const title = getRandomItem(template.titles);
    const description = getRandomItem(template.descriptions);
    const district = getRandomItem(template.districts);
    const address = getRandomItem(template.addresses);
    const status = getRandomItem(statuses);
    const riskLevel = getRandomItem(template.riskLevels);
    const urgencyPercentage = getRandomNumber(template.urgencyRange.min, template.urgencyRange.max);

    // Random user atau anonymous
    const isAnonymous = Math.random() > 0.7;
    const reporter = isAnonymous ? null : getRandomItem(users.filter((u) => u.role === 'user'));

    // Random assignment untuk verified/in_progress/resolved
    const assignedPetugas =
      status !== 'pending' && Math.random() > 0.3 ? getRandomItem(petugas) : null;

    // Images untuk flood dan fire
    const images: string[] = [];
    if (template.type === 'flood' && Math.random() > 0.3) {
      images.push(getRandomItem(floodImages));
    } else if (template.type === 'fire' && Math.random() > 0.3) {
      images.push(getRandomItem(fireImages));
    }

    // Notes untuk reports yang sudah ditangani
    let notes: string | null = null;
    if (status === 'resolved') {
      notes = 'Masalah sudah ditangani dan selesai.';
    } else if (status === 'in_progress') {
      notes = 'Tim petugas sedang menuju lokasi untuk penanganan.';
    } else if (status === 'verified') {
      notes = 'Laporan telah diverifikasi dan sedang dalam proses penanganan.';
    }

    const report = await prisma.disasterReport.create({
      data: {
        type: template.type,
        title: `${title} ${i > 0 ? `#${i + 1}` : ''}`,
        description,
        address: `${address}, ${district}`,
        lat: -6.1 + Math.random() * 0.3, // Random lat di sekitar Jakarta
        lng: 106.7 + Math.random() * 0.3, // Random lng di sekitar Jakarta
        district,
        status,
        riskLevel,
        urgencyPercentage,
        reportedById: reporter?.id || null,
        reporterName: isAnonymous ? 'Anonymous Reporter' : null,
        reporterPhone: isAnonymous ? `081234567${String(i).padStart(3, '0')}` : null,
        assignedToId: assignedPetugas?.id || null,
        handledBy: assignedPetugas?.id || null,
        notes,
        images,
      },
    });

    disasterReports.push(report);
  }

  console.log(`✅ Created ${disasterReports.length} disaster reports`);

  // ============================================
  // CREATE ROAD REPORTS
  // ============================================
  console.log('🛣️  Creating road reports...');

  const roadTemplates = [
    {
      type: 'pothole' as const,
      titles: [
        'Lubang Besar di Jalan Raya',
        'Banyak Lubang Kecil di Jalan',
        'Lubang Dalam di Jalan',
        'Lubang Berbahaya di Jalan',
      ],
      descriptions: [
        'Lubang besar dengan diameter sekitar 1 meter dan kedalaman 30cm di tengah jalan. Sangat berbahaya untuk kendaraan.',
        'Banyak lubang kecil di sepanjang jalan. Perlu perbaikan menyeluruh.',
        'Lubang dalam ditemukan di jalan, sangat berbahaya untuk kendaraan.',
        'Lubang berbahaya di jalan raya, beberapa kendaraan sudah mengalami kerusakan.',
      ],
      dangerLevels: ['minor', 'moderate', 'severe'] as const,
      urgencyRange: { min: 40, max: 90 },
    },
    {
      type: 'crack' as const,
      titles: ['Retakan Panjang di Jalan', 'Retakan Besar di Jalan', 'Jalan Retak Parah'],
      descriptions: [
        'Retakan panjang sekitar 50 meter di sisi kiri jalan. Perlu perbaikan sebelum memburuk.',
        'Retakan besar ditemukan di jalan, perlu perbaikan segera.',
        'Jalan retak parah, sangat berbahaya untuk kendaraan.',
      ],
      dangerLevels: ['minor', 'moderate', 'severe'] as const,
      urgencyRange: { min: 30, max: 80 },
    },
    {
      type: 'flooding' as const,
      titles: ['Genangan Air di Jalan', 'Jalan Terendam Air', 'Genangan Tinggi di Jalan'],
      descriptions: [
        'Genangan air setinggi 20cm di jalan akibat hujan. Menghambat lalu lintas.',
        'Jalan terendam air setinggi 30cm, kendaraan kesulitan melintas.',
        'Genangan air tinggi di jalan, menghambat aktivitas lalu lintas.',
      ],
      dangerLevels: ['minor', 'moderate'] as const,
      urgencyRange: { min: 20, max: 60 },
    },
    {
      type: 'bridge_damage' as const,
      titles: ['Kerusakan pada Jembatan', 'Jembatan Retak', 'Struktur Jembatan Rusak'],
      descriptions: [
        'Ditemukan retakan pada struktur jembatan. Perlu inspeksi lebih lanjut oleh ahli struktur.',
        'Jembatan mengalami retakan, perlu perhatian segera.',
        'Struktur jembatan rusak, sangat berbahaya untuk kendaraan.',
      ],
      dangerLevels: ['moderate', 'severe'] as const,
      urgencyRange: { min: 70, max: 100 },
    },
    {
      type: 'landslide' as const,
      titles: ['Longsor di Jalan', 'Tanah Longsor Menutupi Jalan', 'Jalan Tertutup Longsor'],
      descriptions: [
        'Longsor terjadi di jalan, material tanah menutupi sebagian jalan.',
        'Tanah longsor menutupi jalan, lalu lintas terhambat total.',
        'Jalan tertutup longsor, perlu pembersihan segera.',
      ],
      dangerLevels: ['moderate', 'severe'] as const,
      urgencyRange: { min: 60, max: 95 },
    },
  ];

  const roadDistricts = [
    'Jakarta Pusat',
    'Jakarta Selatan',
    'Jakarta Barat',
    'Jakarta Timur',
    'Jakarta Utara',
  ];

  const roadAddresses = [
    'Jalan Thamrin',
    'Jalan Rasuna Said',
    'Jalan Kemang Raya',
    'Jalan Cikini Raya',
    'Jalan Gatot Subroto',
    'Jalan Sudirman',
    'Jalan Raya Bekasi',
    'Jalan Raya Cikarang',
    'Jalan Raya Bogor',
    'Jalan Raya Depok',
  ];

  const roadReports = [];

  // Create 25 road reports
  for (let i = 0; i < 25; i++) {
    const template = getRandomItem(roadTemplates);
    const title = getRandomItem(template.titles);
    const description = getRandomItem(template.descriptions);
    const district = getRandomItem(roadDistricts);
    const address = getRandomItem(roadAddresses);
    const status = getRandomItem(statuses);
    const dangerLevel = getRandomItem(template.dangerLevels);
    const urgencyPercentage = getRandomNumber(template.urgencyRange.min, template.urgencyRange.max);

    // Random user atau anonymous
    const isAnonymous = Math.random() > 0.7;
    const reporter = isAnonymous ? null : getRandomItem(users.filter((u) => u.role === 'user'));

    // Random assignment untuk verified/in_progress/resolved
    const assignedPetugas =
      status !== 'pending' && Math.random() > 0.3 ? getRandomItem(petugas) : null;

    // Always use images for road reports (random from road images)
    const images: string[] = [];
    if (Math.random() > 0.2) {
      // 80% chance to have image
      images.push(getRandomItem(roadImages));
      if (Math.random() > 0.7) {
        // 30% chance to have second image
        images.push(getRandomItem(roadImages));
      }
    }

    // AI fields untuk road reports
    const aiDetectedIssues: string[] = [];
    const aiConfidence: number | null = Math.random() > 0.3 ? Math.random() * 0.3 + 0.7 : null; // 70-100% atau null
    let aiRecommendedAction: string | null = null;

    if (aiConfidence) {
      if (dangerLevel === 'severe') {
        aiDetectedIssues.push('Kerusakan parah terdeteksi');
        aiRecommendedAction = 'Perbaikan segera diperlukan - kondisi sangat berbahaya';
      } else if (dangerLevel === 'moderate') {
        aiDetectedIssues.push('Kerusakan sedang terdeteksi');
        aiRecommendedAction = 'Perlu perbaikan dalam waktu dekat';
      } else {
        aiDetectedIssues.push('Kerusakan ringan terdeteksi');
        aiRecommendedAction = 'Perlu perawatan rutin';
      }
    }

    const report = await prisma.roadReport.create({
      data: {
        type: template.type,
        title: `${title} ${i > 0 ? `#${i + 1}` : ''}`,
        description,
        address: `${address}, ${district}`,
        lat: -6.1 + Math.random() * 0.3,
        lng: 106.7 + Math.random() * 0.3,
        district,
        status,
        dangerLevel,
        urgencyPercentage,
        reportedById: reporter?.id || null,
        reporterName: isAnonymous ? 'Anonymous Reporter' : null,
        reporterPhone: isAnonymous ? `081234567${String(i + 100).padStart(3, '0')}` : null,
        assignedToId: assignedPetugas?.id || null,
        aiDetectedIssues,
        aiConfidence,
        aiRecommendedAction,
        images,
      },
    });

    roadReports.push(report);
  }

  console.log(`✅ Created ${roadReports.length} road reports`);

  // ============================================
  // CREATE COMMENTS
  // ============================================
  console.log('💬 Creating comments...');

  const commentTemplates = [
    'Saya juga melihat masalah di lokasi tersebut.',
    'Terima kasih atas laporannya. Tim kami sedang menuju lokasi.',
    'Masalah sudah ditangani dengan baik.',
    'Kondisi sudah membaik dari sebelumnya.',
    'Perlu perhatian lebih lanjut untuk masalah ini.',
    'Lokasi ini memang sering mengalami masalah serupa.',
    'Terima kasih sudah melaporkan, akan segera ditindaklanjuti.',
    'Saya setuju dengan laporan ini, kondisi memang seperti itu.',
  ];

  let commentCount = 0;

  // Add comments to random reports
  for (let i = 0; i < 40; i++) {
    const isDisaster = Math.random() > 0.5;
    const reports = isDisaster ? disasterReports : roadReports;
    const report = getRandomItem(reports);
    const commenter = getRandomItem(users);

    const comment = await prisma.comment.create({
      data: {
        reportId: report.id,
        reportType: isDisaster ? 'disaster' : 'road',
        content: getRandomItem(commentTemplates),
        authorId: commenter.id,
        ...(isDisaster ? { disasterReportId: report.id } : { roadReportId: report.id }),
      },
    });

    commentCount++;
  }

  console.log(`✅ Created ${commentCount} comments`);

  // ============================================
  // CREATE ACTIVITIES
  // ============================================
  console.log('📋 Creating activities...');

  let activityCount = 0;

  // Create activities for reports
  for (const report of [...disasterReports, ...roadReports]) {
    // Check if report is disaster or road by checking if it has riskLevel (disaster) or dangerLevel (road)
    const isDisaster = 'riskLevel' in report;

    // Assignment activity
    if (report.status !== 'pending' && Math.random() > 0.4) {
      const assignedPetugas = getRandomItem(petugas);
      await prisma.reportActivity.create({
        data: {
          reportId: report.id,
          reportType: isDisaster ? 'disaster' : 'road',
          activityType: 'assigned',
          description: `Laporan ditugaskan kepada ${assignedPetugas.name}`,
          createdById: admin.id,
          ...(isDisaster ? { disasterReportId: report.id } : { roadReportId: report.id }),
          metadata: {
            assignedTo: assignedPetugas.name,
            assignedToId: assignedPetugas.id,
          },
          images: [],
        },
      });
      activityCount++;
    }

    // Status change activity
    if (report.status === 'verified' || report.status === 'in_progress') {
      const changer = getRandomItem([...petugas, admin]);
      await prisma.reportActivity.create({
        data: {
          reportId: report.id,
          reportType: isDisaster ? 'disaster' : 'road',
          activityType: 'status_changed',
          description: `Status laporan diubah menjadi ${report.status}`,
          createdById: changer.id,
          ...(isDisaster ? { disasterReportId: report.id } : { roadReportId: report.id }),
          metadata: {
            oldStatus: 'pending',
            newStatus: report.status,
          },
          images: [],
        },
      });
      activityCount++;
    }

    // Resolved activity
    if (report.status === 'resolved') {
      const resolver = getRandomItem([...petugas, admin]);
      await prisma.reportActivity.create({
        data: {
          reportId: report.id,
          reportType: isDisaster ? 'disaster' : 'road',
          activityType: 'resolved',
          description: 'Masalah sudah ditangani dan selesai.',
          createdById: resolver.id,
          ...(isDisaster ? { disasterReportId: report.id } : { roadReportId: report.id }),
          metadata: {
            resolution: 'Masalah sudah ditangani dan selesai.',
          },
          images: [],
        },
      });
      activityCount++;
    }
  }

  console.log(`✅ Created ${activityCount} activities`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length} (1 admin, 3 petugas, ${userNames.length} users)`);
  console.log(`   - Disaster Reports: ${disasterReports.length}`);
  console.log(`   - Road Reports: ${roadReports.length}`);
  console.log(`   - Comments: ${commentCount}`);
  console.log(`   - Activities: ${activityCount}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@example.com');
  console.log('     Password: password123');
  console.log('\n   Petugas:');
  console.log('     Email: petugas1@example.com / petugas2@example.com / petugas3@example.com');
  console.log('     Password: password123');
  console.log('\n   User:');
  console.log('     Email: user1@example.com - user12@example.com');
  console.log('     Password: password123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
