import { useEffect } from 'react'
import { Lead } from '../../types/lead'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../common/Sheet'
import { format } from 'date-fns'

interface LeadDetailsSheetProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export default function LeadDetailsSheet({ lead, isOpen, onClose }: LeadDetailsSheetProps) {
  useEffect(() => {
    const handleCloseSheet = () => onClose()
    document.addEventListener('closeSheet', handleCloseSheet)
    return () => document.removeEventListener('closeSheet', handleCloseSheet)
  }, [onClose])

  if (!lead) return null

  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    try {
      return format(new Date(date), 'MMM d, yyyy')
    } catch {
      return "N/A"
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">{lead.name}</SheetTitle>
          <div className="text-sm text-gray-500">{lead.email}</div>
        </SheetHeader>
        
        <div className="px-6 py-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900">Company</h3>
            <p className="mt-1 text-sm text-gray-500">{lead.company}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900">Stage History</h3>
            <div className="mt-2 flow-root">
              <ul className="-mb-8">
                {lead.stage_history.map((stage, stageIdx) => (
                  <li key={`${stage.to_stage}-${stageIdx}`}>
                    <div className="relative pb-8">
                      {stageIdx !== lead.stage_history.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`
                            h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                            ${stage.changed_at ? 'bg-purple-100' : 'bg-gray-100'}
                          `}>
                            <div className={`
                              h-2.5 w-2.5 rounded-full 
                              ${stage.changed_at ? 'bg-purple-600' : 'bg-gray-400'}
                            `} />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              {stage.from_stage ? 
                                `Moved from ${stage.from_stage} to ${stage.to_stage}` : 
                                `Started as ${stage.to_stage}`
                              }
                            </p>
                            {stage.notes && (
                              <p className="mt-0.5 text-xs text-gray-400">
                                {stage.notes}
                              </p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {formatDate(stage.changed_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Additional Details</h3>
            <dl className="mt-2 divide-y divide-gray-100">
              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {lead.status}
                </dd>
              </div>
              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Last Contacted</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {formatDate(lead.last_contacted)}
                </dd>
              </div>
              <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {formatDate(lead.created_at)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 