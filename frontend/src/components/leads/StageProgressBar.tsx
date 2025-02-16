import { LeadStage } from '../../types/lead'
import { LEAD_STAGES } from '../../constants/leads'

interface StageProgressBarProps {
  currentStage: LeadStage
}

export default function StageProgressBar({ currentStage }: StageProgressBarProps) {
  const progress = (LEAD_STAGES.indexOf(currentStage) / (LEAD_STAGES.length - 1)) * 100

  return (
    <div className="relative px-6">
      <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200">
        <div 
          className="absolute top-0 left-0 h-full bg-purple-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 