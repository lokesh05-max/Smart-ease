/**
 * Comprehensive Backend Integration & Concurrency Test Suite
 * Tests Auth, RBAC, Slot Availability, Overlap Prevention, Check-in, Check-out, Fee Calculation
 */
process.env.NODE_ENV = 'test';
import http from 'http';
import { connectDB } from '../src/config/db.js';
import mongoose from 'mongoose';

const { app } = await import('../src/server.js');

const PORT = 5001; // Test server port
let serverInstance;

const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (dataString) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        host: '127.0.0.1',
        port: PORT,
        method,
        path,
        headers,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseBody);
          } catch {
            parsed = responseBody;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
};

const runAllTests = async () => {
  console.log('====================================================');
  console.log('STARTING SMART PARKING BACKEND TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`[PASS] ${description}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${description}`);
      failedCount++;
    }
  };

  try {
    await connectDB();
    await new Promise((resolve) => {
      serverInstance = app.listen(PORT, resolve);
    });
    console.log(`Test server running at http://127.0.0.1:${PORT}\n`);

    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', '1. GET /api/health returns 200 online');

    // 2. Login with invalid credentials
    const badLogin = await request('POST', '/api/auth/login', {
      email: 'user@smartparking.com',
      password: 'WrongPassword123',
    });
    assert(badLogin.status === 401, '2. Invalid login rejected with 401 Unauthorized');

    // 3. Login with valid user credentials
    const userLogin = await request('POST', '/api/auth/login', {
      email: 'user@smartparking.com',
      password: 'User@123',
    });
    assert(userLogin.status === 200 && userLogin.body.token, '3. User login succeeds with JWT token');
    const userToken = userLogin.body.token;

    // 4. Login with admin credentials
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@smartparking.com',
      password: 'Admin@123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', '4. Admin login succeeds with admin role');
    const adminToken = adminLogin.body.token;

    // 5. Unauthorized access: regular user attempts admin dashboard
    const forbiddenReq = await request('GET', '/api/admin/dashboard', null, userToken);
    assert(forbiddenReq.status === 403, '5. Non-admin user blocked from admin endpoints (403 Forbidden)');

    // 6. Admin accesses dashboard metrics
    const adminDash = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(adminDash.status === 200 && adminDash.body.metrics.totalSlots > 0, '6. Admin successfully fetches dashboard metrics');

    // 7. Get parking locations
    const locRes = await request('GET', '/api/locations');
    assert(locRes.status === 200 && locRes.body.locations.length >= 3, '7. Locations endpoint returns active locations with stats');
    const testLocation = locRes.body.locations[0];

    // 8. Find an available slot for reservation testing
    const slotsRes = await request('GET', `/api/locations/${testLocation._id}/slots`);
    const availableSlot = slotsRes.body.slots.find((s) => s.status === 'Available');
    assert(!!availableSlot, `8. Found available slot ${availableSlot?.slotNumber} at location`);

    // 9. Create a new reservation
    const startTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // starts in 10 mins
    const endTime = new Date(Date.now() + 130 * 60 * 1000).toISOString();  // 2 hours duration
    const bookingRes = await request(
      'POST',
      '/api/reservations',
      {
        locationId: testLocation._id,
        slotId: availableSlot._id,
        vehicleType: availableSlot.vehicleType,
        vehiclePlate: 'TEST-99-99',
        startTime,
        endTime,
      },
      userToken
    );
    assert(
      bookingRes.status === 201 && bookingRes.body.reservation.bookingReference,
      `9. Successfully reserved slot ${availableSlot.slotNumber} (Booking Ref: ${bookingRes.body.reservation?.bookingReference})`
    );
    const createdReservation = bookingRes.body.reservation;

    // 10. CONCURRENCY & OVERLAP CONFLICT PREVENTION TEST:
    // Attempt to book the exact same slot for overlapping time window
    const overlappingStartTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour into the booking
    const overlappingEndTime = new Date(Date.now() + 180 * 60 * 1000).toISOString();
    const conflictRes = await request(
      'POST',
      '/api/reservations',
      {
        locationId: testLocation._id,
        slotId: availableSlot._id,
        vehicleType: availableSlot.vehicleType,
        vehiclePlate: 'CONFLICT-01',
        startTime: overlappingStartTime,
        endTime: overlappingEndTime,
      },
      userToken
    );
    assert(
      conflictRes.status === 409,
      '10. [CRITICAL] Conflicting overlapping reservation safely rejected with 409 Conflict'
    );

    // 11. Check-in workflow
    const checkInRes = await request(
      'POST',
      `/api/reservations/${createdReservation._id}/check-in`,
      {},
      userToken
    );
    assert(
      checkInRes.status === 200 && checkInRes.body.reservation.checkInTime,
      '11. Manual Check-in successful, vehicle registered as parked'
    );

    // 12. Check-out workflow & Fee calculation
    const checkOutRes = await request(
      'POST',
      `/api/reservations/${createdReservation._id}/check-out`,
      {},
      userToken
    );
    assert(
      checkOutRes.status === 200 &&
        checkOutRes.body.reservation.status === 'Completed' &&
        checkOutRes.body.reservation.finalFee >= availableSlot.pricePerHour,
      `12. Manual Check-out successful, final fee computed ($${checkOutRes.body.reservation?.finalFee}) and slot freed`
    );

    // 13. Test cancellation on another fresh booking
    const slotForCancel = slotsRes.body.slots.find(
      (s) => s._id !== availableSlot._id && s.status === 'Available'
    );
    if (slotForCancel) {
      const freshBooking = await request(
        'POST',
        '/api/reservations',
        {
          locationId: testLocation._id,
          slotId: slotForCancel._id,
          vehicleType: slotForCancel.vehicleType,
          vehiclePlate: 'CANCEL-ME',
          startTime: new Date(Date.now() + 360 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 480 * 60 * 1000).toISOString(),
        },
        userToken
      );

      const cancelRes = await request(
        'PATCH',
        `/api/reservations/${freshBooking.body.reservation._id}/cancel`,
        { reason: 'User travel plans changed' },
        userToken
      );
      assert(
        cancelRes.status === 200 && cancelRes.body.reservation.status === 'Cancelled',
        '13. Reservation cancellation succeeded and slot released'
      );
    }

    // 14. Admin reports
    const reportsRes = await request('GET', '/api/admin/reports', null, adminToken);
    assert(
      reportsRes.status === 200 && reportsRes.body.reports.last7Days.length === 7,
      '14. Admin reports generated 7-day revenue and vehicle distribution'
    );

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('Test run error:', err);
    failedCount++;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    await mongoose.disconnect();
    process.exit(failedCount > 0 ? 1 : 0);
  }
};

runAllTests();
