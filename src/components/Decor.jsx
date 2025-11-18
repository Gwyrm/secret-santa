import React from 'react';

export default function Decor(){
  // create many snowflakes positions
  const flakes = Array.from({length: 28}).map((_,i)=>({
    left: Math.random()*100,
    delay: Math.random()*-20,
    duration: 8 + Math.random()*8,
    size: 10 + Math.random()*18,
    opacity: 0.6 + Math.random()*0.4
  }));

  return (
    <>
      <div className="garland" aria-hidden>
        {Array.from({length: 28}).map((_,i)=> {
          const colors = ["#f44336","#ffeb3b","#4caf50","#ff9800","#e91e63","#8bc34a"];
          return <div key={i} className="bulb" style={{background: colors[i % colors.length]}} />;
        })}
      </div>

      {flakes.map((f, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`
          }}
        >
          ❆
        </div>
      ))}
    </>
  );
}