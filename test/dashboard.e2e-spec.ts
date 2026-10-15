import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

describe('Student Dashboard Backend E2E Tests', () => {
  let app: NestFastifyApplication;
  let authToken: string;
  let peerAuthToken: string;
  let studentId: string;
  let announcementId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Health Check (GET /api/v1/health)', () => {
    it('should return 200 OK and database connected status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.service).toBe('student-education-api');
      expect(body.database).toBe('connected');
      expect(body).toHaveProperty('timestamp');
    });
  });

  describe('2. Authentication (POST /api/v1/auth/login)', () => {
    it('should authenticate demo student and return access token and profile', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'student@vidya.local',
          password: 'Student@2026!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('expiresIn');
      expect(body.student).toHaveProperty('id');
      expect(body.student.email).toBe('student@vidya.local');
      expect(body.student.fullName).toBe('Aditya Varma');
      expect(body.student.classLevel).toBe(8);
      expect(body.student.board).toBe('Andhra Pradesh State Board');
      // Password hash must NEVER be returned
      expect(body.student.passwordHash).toBeUndefined();

      authToken = body.accessToken;
      studentId = body.student.id;
    });

    it('should also authenticate peer student for cross-isolation testing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'sita.r@vidya.local',
          password: 'Student@2026!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      peerAuthToken = body.accessToken;
    });

    it('should return 401 with generic error for invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'student@vidya.local',
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid email or password');
    });

    it('should return 401 with generic error for non-existent email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@vidya.local',
          password: 'Student@2026!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Invalid email or password');
    });

    it('should return 400 validation error for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'not-an-email',
          password: 'Student@2026!',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('3. Token Validation & Route Protection', () => {
    it('should reject unauthenticated request to /api/v1/dashboard with 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject invalid bearer token with 401', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: {
          authorization: 'Bearer invalid.token.payload',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('4. Aggregated Dashboard (GET /api/v1/dashboard)', () => {
    it('should return complete aggregated dashboard for authenticated student', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Student Profile
      expect(body.student).toBeDefined();
      expect(body.student.id).toBe(studentId);
      expect(body.student.fullName).toBe('Aditya Varma');
      expect(body.student.classLevel).toBe(8);

      // Tasks
      expect(Array.isArray(body.tasks)).toBe(true);
      expect(body.tasks.length).toBeGreaterThan(0);

      // Continue Learning
      expect(body.continueLearning).toBeDefined();
      expect(body.continueLearning).not.toBeNull();
      expect(body.continueLearning.title).toContain('Representation on Number Line');
      expect(body.continueLearning.progressPercent).toBe(65);

      // Subjects (Class 8: 7 AP subjects)
      expect(Array.isArray(body.subjects)).toBe(true);
      expect(body.subjects.length).toBe(7);

      // Progress
      expect(body.progress).toBeDefined();
      expect(body.progress.completedLessons).toBeGreaterThanOrEqual(1);
      expect(body.progress.completedTasks).toBeGreaterThanOrEqual(1);
      expect(body.progress.averageQuizScore).toBe(90.0);
      expect(Array.isArray(body.progress.weeklyActivity)).toBe(true);

      // Announcements
      expect(Array.isArray(body.announcements)).toBe(true);
      expect(body.announcements.length).toBeGreaterThan(0);

      // Quick Actions
      expect(body.quickActions).toBeDefined();
      expect(body.quickActions.bookmarksCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. Dashboard Tasks Endpoint (GET /api/v1/dashboard/tasks)', () => {
    it('should return tasks with dynamic overdue derivation', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/tasks',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.tasks)).toBe(true);
      expect(body.total).toBeGreaterThan(0);

      const overdueTask = body.tasks.find((t: any) => t.isOverdue === true);
      expect(overdueTask).toBeDefined();
      expect(overdueTask.status).toBe('OVERDUE');
    });

    it('should filter tasks by period=today', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/tasks?period=today',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.tasks)).toBe(true);
      expect(body.tasks.length).toBeGreaterThan(0);
      expect(body.tasks[0].title).toContain('Force and Pressure');
    });

    it('should return 400 for invalid period parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/tasks?period=invalid-period',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('6. Subjects Endpoint (GET /api/v1/dashboard/subjects)', () => {
    it('should return only Class 8 subjects (7 subjects) and never expose Class 7 subjects', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/subjects',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const subjects = JSON.parse(response.body);
      expect(Array.isArray(subjects)).toBe(true);
      expect(subjects.length).toBe(7);

      // Verify all returned subjects have classLevel 8
      for (const sub of subjects) {
        expect(sub.classLevel).toBe(8);
      }

      // Verify SCERT AP Class 8 subjects exist
      const codes = subjects.map((s: any) => s.code);
      expect(codes).toContain('MATH08');
      expect(codes).toContain('PHY08');
      expect(codes).toContain('BIO08');
      expect(codes).toContain('SOC08');
      expect(codes).toContain('ENG08');
      expect(codes).toContain('TEL08');
      expect(codes).toContain('HIN08');

      // Verify Class 7 subject codes do NOT exist in student's response
      expect(codes).not.toContain('MATH07');
      expect(codes).not.toContain('SCI07');
    });
  });

  describe('7. Continue Learning Endpoint (GET /api/v1/dashboard/continue-learning)', () => {
    it('should return the most recently accessed eligible learning item with progress', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/continue-learning',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const item = JSON.parse(response.body);
      expect(item).not.toBeNull();
      expect(item.title).toContain('1.2 Representation on Number Line');
      expect(item.progressPercent).toBe(65);
      expect(item.subject.name).toBe('Mathematics');
      expect(item.chapterTitle).toBe('Chapter 1: Rational Numbers');
    });
  });

  describe('8. Learning Progress Endpoint (GET /api/v1/dashboard/progress)', () => {
    it('should calculate accurate progress metrics and weekly activity', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/progress',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.completedLessons).toBeGreaterThanOrEqual(1);
      expect(body.completedTasks).toBeGreaterThanOrEqual(1);
      expect(body.averageQuizScore).toBe(90.0);
      expect(body.weeklyActivity).toHaveLength(7);
      expect(body.subjectWiseProgress).toHaveLength(7);
    });
  });

  describe('9. Announcements & Idempotent Read (GET/PATCH /api/v1/dashboard/announcements)', () => {
    it('should return announcements relevant to student and exclude other class announcements', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/announcements',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const announcements = JSON.parse(response.body);
      expect(Array.isArray(announcements)).toBe(true);

      // Should include School-wide and Class 8 announcements
      const titles = announcements.map((a: any) => a.title);
      expect(titles.some((t: string) => t.includes('Academic Calendar'))).toBe(true);
      expect(titles.some((t: string) => t.includes('Class 8 Science Exhibition'))).toBe(true);

      // Should NEVER include Class 10 announcement
      expect(titles.some((t: string) => t.includes('Class 10 SSC Board'))).toBe(false);

      expect(announcements.length).toBeGreaterThan(0);
      announcementId = announcements[0].id;
    });

    it('should idempotently mark an unread announcement as read', async () => {
      // First call: marks as read
      const response1 = await app.inject({
        method: 'PATCH',
        url: `/api/v1/announcements/${announcementId}/read`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response1.statusCode).toBe(200);
      const body1 = JSON.parse(response1.body);
      expect(body1.success).toBe(true);
      expect(body1.announcementId).toBe(announcementId);

      // Second call: idempotent, succeeds without error
      const response2 = await app.inject({
        method: 'PATCH',
        url: `/api/v1/announcements/${announcementId}/read`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response2.statusCode).toBe(200);
      const body2 = JSON.parse(response2.body);
      expect(body2.success).toBe(true);
    });
  });

  describe('10. Bookmarks Preview & Student Data Isolation (GET /api/v1/dashboard/bookmarks)', () => {
    it('should return bookmarks preview for student 1', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/bookmarks',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.totalCount).toBeGreaterThanOrEqual(1);
      expect(body.bookmarks.length).toBeGreaterThanOrEqual(1);
      expect(body.bookmarks[0].title).toBe('1.1 Properties of Rational Numbers');
    });

    it('should ensure peer student does NOT see student 1 bookmarks (data isolation)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/dashboard/bookmarks',
        headers: {
          authorization: `Bearer ${peerAuthToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      // Peer student has 0 bookmarks
      expect(body.totalCount).toBe(0);
      expect(body.bookmarks).toHaveLength(0);
    });
  });
});
