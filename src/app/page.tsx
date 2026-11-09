"use client";

import React, { useState, useMemo } from "react";
import {
  Navbar,
  Footer,
  DashboardHeader,
  MetricCard,
  MissionLaunchpad,
  FilterBar,
  TaskCard,
  Pagination,
  DeliverablesModal,
  LiveExecutionModal,
  FilterCategory,
  TaskItem,
} from "../types";
import { initialMetrics, initialTasks } from "../data/mockData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const [selectedSort, setSelectedSort] = useState("Sort: Most Recent");
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskForModal, setSelectedTaskForModal] =
    useState<TaskItem | null>(null);
  const [liveExecutionTask, setLiveExecutionTask] =
    useState<TaskItem | null>(null);

  // Compute category counts
  const counts = useMemo(() => {
    return {
      all: 34,
      active: 2,
      completed: 28,
      drafts: 4,
    };
  }, []);

  // Filter tasks based on search input and selected tab
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by category tab
      if (selectedFilter === "active" && task.status !== "active") return false;
      if (selectedFilter === "completed" && task.status !== "completed")
        return false;
      if (selectedFilter === "drafts" && task.status !== "draft") return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesId = task.id.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        const matchesAgent = task.agents?.some(
          (agent) =>
            agent.name.toLowerCase().includes(query) ||
            (agent.handle && agent.handle.toLowerCase().includes(query)),
        );
        return matchesTitle || matchesId || matchesCategory || matchesAgent;
      }

      return true;
    });
  }, [tasks, selectedFilter, searchQuery]);

  const handleRefresh = () => {
    // Simulated state refresh
    setTasks([...initialTasks]);
  };

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-[1600px] mx-auto">
            {/* Header Section */}
            <DashboardHeader onRefresh={handleRefresh} />

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {initialMetrics.map((metric, idx) => (
                <MetricCard key={idx} item={metric} />
              ))}
            </div>

            {/* Quick Navigation Launchpad */}
            <MissionLaunchpad />

            {/* Search & Filters Toolbar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              counts={counts}
            />

            {/* Tasks List Container */}
            <div className="flex flex-col gap-space-md">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onInspect={(t) => setSelectedTaskForModal(t)}
                    onViewLive={(t) => setLiveExecutionTask(t)}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-surface-container/40 p-space-xl text-center flex flex-col items-center justify-center gap-space-sm border border-surface-container-high/40">
                  <span className="material-symbols-outlined text-[32px] text-outline">
                    search_off
                  </span>
                  <p className="font-headline-sm text-on-surface">
                    No tasks found
                  </p>
                  <p className="font-body-sm text-on-surface-variant">
                    Try adjusting your search query or filter settings.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination & Trust Footnote */}
            <Pagination
              currentPage={1}
              startItem={1}
              endItem={filteredTasks.length}
              totalItems={counts[selectedFilter]}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Deliverables Inspector Modal */}
      <DeliverablesModal
        task={selectedTaskForModal}
        isOpen={Boolean(selectedTaskForModal)}
        onClose={() => setSelectedTaskForModal(null)}
      />

      {/* Live Execution Log Modal */}
      <LiveExecutionModal
        task={liveExecutionTask}
        isOpen={Boolean(liveExecutionTask)}
        onClose={() => setLiveExecutionTask(null)}
      />
    </>
  );
}
