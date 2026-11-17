import React from 'react';
import {
  Server,
  Database,
  Radio,
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck,
  CheckCircle,
} from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-shadow-100 text-shadow-700 text-xs font-semibold uppercase tracking-wider border border-shadow-200">
          College Project Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zeus-900 tracking-tight">
          Real-Time Smart Parking Reservation & Management System
        </h1>
        <p className="text-base text-kabul-500 leading-relaxed">
          An end-to-end full-stack software engineering project designed to eliminate parking search delays,
          mitigate urban traffic bottlenecks, and optimize parking slot occupancy with real-time web technologies.
        </p>
      </div>

      {/* Problem Statement & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl bg-white border border-cloud-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-zeus-900">The Problem</h2>
          <p className="text-sm text-kabul-500 leading-relaxed">
            In modern urban hubs and commercial complexes, drivers spend an average of 15 to 20 minutes
            cruising for vacant parking spaces. This cruising causes up to 30% of downtown traffic congestion,
            wastes substantial fuel, elevates carbon emissions, and induces commuter stress.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-cloud-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-zeus-900">Our Smart Solution</h2>
          <p className="text-sm text-kabul-500 leading-relaxed">
            ParkEase implements a centralized digital infrastructure connecting drivers and facility operators.
            Through bidirectional WebSockets (Socket.IO), slot state changes propagate in real time,
            enabling drivers to reserve guaranteed parking bays ahead of arrival and check-in effortlessly.
          </p>
        </div>
      </div>

      {/* Tech Stack Architecture */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-shadow-600">
            System Architecture
          </h2>
          <h3 className="text-2xl font-extrabold text-zeus-900">Technology Stack & Design</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cloud-100 text-zeus-900 flex items-center justify-center">
              <Layers className="w-5 h-5 text-shadow-500" />
            </div>
            <h4 className="font-bold text-zeus-900">Frontend Tier</h4>
            <ul className="text-xs text-kabul-500 space-y-1.5 list-disc list-inside">
              <li>React 18 with Vite toolchain</li>
              <li>Tailwind CSS design system</li>
              <li>React Router v6 declarative routing</li>
              <li>Recharts interactive analytics</li>
              <li>Lucide React iconography</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-shadow-100 text-shadow-700 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zeus-900">Backend API Tier</h4>
            <ul className="text-xs text-kabul-500 space-y-1.5 list-disc list-inside">
              <li>Node.js runtime environment</li>
              <li>Express.js RESTful routing</li>
              <li>JWT Bearer token authentication</li>
              <li>bcrypt password hashing (10 salt rounds)</li>
              <li>express-validator schema validation</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cloud-200 text-zeus-900 flex items-center justify-center">
              <Database className="w-5 h-5 text-kabul-500" />
            </div>
            <h4 className="font-bold text-zeus-900">Persistence Tier</h4>
            <ul className="text-xs text-kabul-500 space-y-1.5 list-disc list-inside">
              <li>MongoDB document database</li>
              <li>Mongoose ODM schemas & virtuals</li>
              <li>Compound unique indexing</li>
              <li>Time-overlap indexing query optimization</li>
              <li>Activity audit trail logging</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-cloud-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-kabul-300/20 text-kabul-700 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zeus-900">Real-Time Sync Tier</h4>
            <ul className="text-xs text-kabul-500 space-y-1.5 list-disc list-inside">
              <li>Socket.IO bidirectional engine</li>
              <li>Location room multicasting</li>
              <li>Event-driven slot updates</li>
              <li>Live occupancy recalculation</li>
              <li>Instant dashboard stats sync</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Concurrency Prevention Strategy Deep Dive */}
      <div className="p-8 rounded-3xl bg-zeus-950 text-cloud-100 space-y-6 border border-zeus-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-shadow-500 text-white">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Concurrency & Conflict Prevention Mechanism</h3>
            <p className="text-xs text-cloud-400">
              Guaranteeing zero double-bookings under concurrent client requests
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-cloud-300">
          <div className="space-y-3 bg-zeus-900/80 p-5 rounded-2xl border border-zeus-800">
            <h4 className="font-bold text-shadow-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Time-Window Overlap Theorem
            </h4>
            <p className="text-xs leading-relaxed text-cloud-300">
              Two reservations <code className="text-shadow-300 font-mono">A</code> and{' '}
              <code className="text-shadow-300 font-mono">B</code> conflict if and only if:{' '}
              <span className="font-mono bg-zeus-950 px-2 py-0.5 rounded text-amber-300">
                (A.start &lt; B.end) &amp;&amp; (A.end &gt; B.start)
              </span>
              . Our reservation controller executes this check against the database before any booking is committed.
            </p>
          </div>

          <div className="space-y-3 bg-zeus-900/80 p-5 rounded-2xl border border-zeus-800">
            <h4 className="font-bold text-shadow-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Atomic Mutex Critical Section
            </h4>
            <p className="text-xs leading-relaxed text-cloud-300">
              If two users submit booking requests for the exact same slot at the exact same millisecond,
              our <code className="text-shadow-300 font-mono">KeyedMutex</code> serializes the operations on that slot ID.
              The first request obtains the slot, while the concurrent request is safely rejected with a{' '}
              <span className="font-mono bg-zeus-950 px-2 py-0.5 rounded text-rose-300">
                409 Conflict
              </span>{' '}
              HTTP code.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Project Credits */}
      <div className="p-6 rounded-2xl bg-cloud-100 border border-cloud-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-zeus-900">
            Academic Project Implementation
          </h4>
          <p className="text-xs text-kabul-500">
            Submitted in partial fulfillment of the requirements for the Degree of Bachelor of Technology in CSE.
          </p>
        </div>
        <div className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-shadow-500 text-white shadow-xs">
          Academic Year 2026
        </div>
      </div>
    </div>
  );
};
