import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FlaskConical, 
  Search, 
  Plus, 
  Trash2, 
  X,
  Loader2,
  Box
} from "lucide-react";

interface QATestItem {
  test_run_id: string;
  application_id: string;
  version: string;
  status: string;
  total: number;
  passed: number;
  failed: number;
  duration_seconds: number;
}

export function QATestsPage() {
  const [qaTests, setQaTests] = useState<QATestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQATests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/qa/webhook");
      if (res.ok) {
        const data = await res.json();
        setQaTests(Array.isArray(data) ? data : []);
      } else {
        setQaTests([]);
      }
    } catch (err) {
      console.error("Error fetching QA tests:", err);
      setQaTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQATests();
  }, []);

  const filteredTests = qaTests.filter(t => 
    t.test_run_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.application_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">QA Automation & Testing</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated test suite execution results, unit/integration pass rates, and QA webhooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">QA Tests</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-3 bg-[#090d0b] border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search test runs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredTests.length}</span> test runs
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading test runs from MongoDB...
        </div>
      ) : filteredTests.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No QA Test Runs</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No test runs match your search query." : "No QA test runs recorded yet. Test webhooks will stream test results when triggered."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => (
            <Card key={test.test_run_id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{test.application_id} ({test.version})</h3>
                  <span className="text-[10px] font-mono text-zinc-500">Run ID: {test.test_run_id}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {test.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Passed / Total:</span>
                  <span className="text-emerald-400">{test.passed} / {test.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration:</span>
                  <span className="text-zinc-300">{test.duration_seconds}s</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
