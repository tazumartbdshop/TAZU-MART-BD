import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export function SystemHealthCard() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) return <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg animate-pulse">Loading status...</div>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">Error: {error}</div>;
  if (!status) return null;

  return (
    <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-wider">System Health</h3>
        <button onClick={fetchStatus} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <RefreshCw className="w-4 h-4 text-zinc-500" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {status.monitors.map((monitor: any) => (
          <div key={monitor.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
            <div className="flex items-center gap-2 mb-1">
              {monitor.status === 2 ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs font-bold text-zinc-700">{monitor.friendly_name}</span>
            </div>
            <div className="text-sm font-semibold">
              {monitor.status === 2 ? 'Online' : 'Offline'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-100">
        <span>Uptime: {status.overallUptime}%</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last check: {new Date(status.lastCheck).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
