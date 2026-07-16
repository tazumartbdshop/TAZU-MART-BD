import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw, Loader2, Server, Clock, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PingResult {
  success: boolean;
  message: string;
  durationMs?: number;
  timestamp: string;
  host?: string;
  database?: string;
  error?: string;
  count?: number;
}

export default function ConnectivityTest() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDatabasePing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data);
      } else {
        setResult(data);
        setError(data.error || data.message || 'Failed to query database');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with test endpoint');
      setResult({
        success: false,
        message: 'Network Error: Frontend could not reach server API endpoint',
        timestamp: new Date().toISOString(),
        error: err.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run an initial ping test automatically when the page loads
    runDatabasePing();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans" id="connectivity-test-page">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-neutral-900 text-white rounded-full mb-4 shadow-md">
            <Database className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">
            Database Diagnostics
          </h1>
          <p className="text-sm text-neutral-500 font-medium uppercase tracking-widest mt-1">
            MySQL Production Backend Connectivity
          </p>
        </div>

        {/* Status card */}
        <div className="bg-white border border-neutral-200 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full ${
            loading ? 'bg-zinc-400' : (result?.success ? 'bg-emerald-500' : 'bg-rose-500')
          }`}></div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Connection Status</span>
                {loading ? (
                  <span className="bg-neutral-100 text-neutral-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-neutral-200 rounded">
                    Testing...
                  </span>
                ) : result?.success ? (
                  <span className="bg-emerald-50/80 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-emerald-200 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Online
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-rose-200 rounded flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Offline
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
                {loading ? 'Pinging Production DB...' : (result?.success ? 'Connection Operational' : 'Connection Failed')}
              </h2>
              <p className="text-neutral-500 text-sm mt-1 max-w-lg">
                {loading ? 'Testing real-time query roundtrip latency to host auth-db2141.hstgr.io.' : (
                  result?.success 
                    ? 'The application is properly reaching and querying the production MySQL database hosted on Hostinger.'
                    : 'The frontend/backend server was unable to fetch credentials or run queries against the production host.'
                )}
              </p>
            </div>

            <button
              onClick={runDatabasePing}
              disabled={loading}
              className="md:self-center bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {/* Details segment */}
          <div className="mt-8 pt-8 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Target Configuration
              </h3>
              <div className="bg-neutral-50 border border-neutral-150 p-4 font-mono text-xs text-neutral-700 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Host:</span>
                  <span className="font-bold text-neutral-900 select-all">auth-db2141.hstgr.io</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Database Name:</span>
                  <span className="font-bold text-neutral-900 select-all">u103041740_TAZU_MART_BD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Port:</span>
                  <span className="font-bold text-neutral-900">3306</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Dialect:</span>
                  <span className="font-bold text-neutral-900">MySQL 8+ (mysql2/promise)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Latest Telemetry
              </h3>
              <div className="bg-neutral-50 border border-neutral-150 p-4 font-mono text-xs text-neutral-700 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Roundtrip Latency:</span>
                  <span className={`font-black ${result?.durationMs && result.durationMs < 200 ? 'text-emerald-600' : 'text-neutral-900'}`}>
                    {loading ? 'Evaluating...' : (result?.durationMs ? `${result.durationMs}ms` : 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Query Verification:</span>
                  <span className="font-bold text-neutral-900">
                    {loading ? 'Evaluating...' : (result?.success ? 'SELECT * FROM settings LIMIT 1 (Passed)' : 'Failed')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Settings Count:</span>
                  <span className="font-bold text-neutral-900">
                    {loading ? 'Evaluating...' : (result?.count !== undefined ? `${result.count} rows returned` : 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Timestamp:</span>
                  <span className="text-neutral-600">
                    {loading ? 'Evaluating...' : (result?.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Console / Errors */}
        <div className="bg-neutral-950 border border-neutral-800 p-6 shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-800">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Diagnostic Console Logs
            </span>
            <span className="text-[9px] text-neutral-500 font-mono">UTC-6 / ISO-8601</span>
          </div>

          <div className="font-mono text-xs text-neutral-300 space-y-3 max-h-[250px] overflow-y-auto select-text scrollbar-thin scrollbar-thumb-neutral-800">
            <div>
              <span className="text-neutral-500">[{new Date().toISOString()}]</span>
              <span className="text-sky-400 ml-2">[INFO]</span> Initializing database driver setup (mysql2)...
            </div>
            <div>
              <span className="text-neutral-500">[{new Date().toISOString()}]</span>
              <span className="text-sky-400 ml-2">[INFO]</span> Client Pool generated with limit constraints (limit=10).
            </div>
            <div>
              <span className="text-neutral-500">[{new Date().toISOString()}]</span>
              <span className="text-amber-400 ml-2">[TEST]</span> Dispatching check ping query: <code className="bg-neutral-900 text-amber-200 px-1 py-0.5 border border-neutral-800 rounded">SELECT * FROM `settings` LIMIT 1</code>
            </div>

            {loading ? (
              <div className="text-neutral-400 animate-pulse">
                <span className="text-neutral-500">[{new Date().toISOString()}]</span>
                <span className="text-zinc-400 ml-2">[PEND]</span> Transmitting packet, awaiting query promise resolve...
              </div>
            ) : result ? (
              result.success ? (
                <>
                  <div className="text-emerald-400">
                    <span className="text-neutral-500">[{result.timestamp}]</span>
                    <span className="text-emerald-400 ml-2">[SUCCESS]</span> Roundtrip packet resolved safely in {result.durationMs}ms.
                  </div>
                  <div className="text-zinc-400 text-[11px] bg-neutral-900 border border-neutral-800 p-3 mt-2 rounded leading-relaxed">
                    <div className="text-emerald-400 font-bold mb-1">Response Data:</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify({
                      success: true,
                      message: result.message,
                      durationMs: result.durationMs,
                      target: {
                        host: result.host,
                        database: result.database
                      }
                    }, null, 2)}</pre>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-rose-400">
                    <span className="text-neutral-500">[{result.timestamp}]</span>
                    <span className="text-rose-400 ml-2">[ERROR]</span> Connection check failed. Database returned exception message.
                  </div>
                  {error && (
                    <div className="text-rose-300 text-[11px] bg-red-950/20 border border-red-900/40 p-3 mt-2 rounded leading-relaxed">
                      <div className="text-rose-400 font-bold mb-1">Exception Details:</div>
                      <p className="break-all">{error}</p>
                    </div>
                  )}
                </>
              )
            ) : null}

            {error && (
              <div className="bg-amber-950/20 border border-amber-900/30 p-4 mt-4 space-y-2 rounded-lg text-[11px] text-amber-200 font-sans leading-relaxed">
                <div className="font-black uppercase tracking-widest text-[10px] text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Troubleshooting Recommendations
                </div>
                <ul className="list-disc pl-4 space-y-1 text-amber-300/90">
                  <li>Ensure the container network allows outgoing connections on port 3306.</li>
                  <li>Verify if the database host <code className="bg-neutral-900 px-1 text-white">auth-db2141.hstgr.io</code> has whitelisted the current server's outbound IP.</li>
                  <li>Check that your database credentials in <code className="bg-neutral-900 px-1 text-white">src/lib/mysql_db.ts</code> match the Hostinger MySQL configuration exactly.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
