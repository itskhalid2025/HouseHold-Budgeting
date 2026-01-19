export default function Dashboard() {
    return (
        <div className="container">
            <h1>Dashboard</h1>
            <p>Welcome to HomeHarmony Budget! Your household financial overview will appear here.</p>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Income</h3>
                    <p className="amount">$0.00</p>
                </div>
                <div className="stat-card">
                    <h3>Total Expenses</h3>
                    <p className="amount">$0.00</p>
                </div>
                <div className="stat-card">
                    <h3>Savings</h3>
                    <p className="amount">$0.00</p>
                </div>
            </div>
        </div>
    );
}
