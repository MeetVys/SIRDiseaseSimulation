const TABS = [
  { id: "simulation", label: "Simulation" },
  { id: "about", label: "About the Model" },
  { id: "how", label: "How It Works" },
];

export default function TabBar({ activeTab, onChangeTab }) {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "tab-active" : ""}`}
          onClick={() => onChangeTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
