import React from 'react'

const Loader = () => {
  
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient background elements */}
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex justify-center items-center min-h-screen">
          <div className="text-center bg-surface/80 backdrop-blur-xl border border-surface/50 rounded-2xl p-12 shadow-card">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto border-4 border-accent/30 rounded-full animate-spin border-t-accent"></div>
              <div className="absolute inset-0 w-16 h-16 mx-auto mt-2 border-2 border-primary/20 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Loading Your Shipments</h3>
            <p className="text-textSecondary">Please wait while we fetch your data...</p>
          </div>
        </div>
      </div>
    );
}

export default Loader