// components/ActionButtons.jsx
import React from 'react';
import HitButton from './buttons/HitButton';
import StandButton from './buttons/StandButton';
import DoubleButton from './buttons/DoubleButton';
import SplitButton from './buttons/SplitButton';
import InsuranceButton from './buttons/InsuranceButton';

const ActionButtons = ({ onHit, onStand, onDouble, onSplit, onInsurance }) => {
  return (
    <div className="action-buttons">
      <HitButton onClick={onHit} />
      <StandButton onClick={onStand} />
      <DoubleButton onClick={onDouble} />
      <SplitButton onClick={onSplit} />
      <InsuranceButton onClick={onInsurance} />
    </div>
  );
};

export default ActionButtons;
