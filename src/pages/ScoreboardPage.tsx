import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Medal, Plus } from 'lucide-react';
import { useDb } from '../hooks/useDb';
import { leaderboard } from '../lib/selectors';
import { teamLabel } from '../lib/constants';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { AddScoreModal } from '../components/scoreboard/AddScoreModal';

const MEDAL_COLORS = ['#eda100', '#9aa0a6', '#cd7f32'];

export function ScoreboardPage() {
  const db = useDb();
  const rows = leaderboard(db);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add')) {
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div>
      <PageHeader
        title="טבלת ניקוד"
        subtitle="דירוג מצטבר של כלל החניכים"
        actions={
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            הוספת ניקוד
          </Button>
        }
      />

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-xs text-ink3 border-b border-line bg-surface2/60">
                <th className="text-center py-3 px-3 font-semibold w-16">דירוג</th>
                <th className="text-start py-3 px-3 font-semibold">חניך</th>
                <th className="text-center py-3 px-3 font-semibold">ניקוד</th>
                <th className="text-center py-3 px-3 font-semibold">נוכחות</th>
                <th className="text-center py-3 px-3 font-semibold">שיפור 3 ק"מ</th>
                <th className="text-center py-3 px-3 font-semibold">משימות</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.cadet.id}
                  className={`border-b border-line last:border-0 hover:bg-surface2/40 transition-colors ${
                    row.rank <= 3 ? 'bg-lvlb/5' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center">
                    {row.rank <= 3 ? (
                      <Medal size={20} className="inline-block" style={{ color: MEDAL_COLORS[row.rank - 1] }} aria-label={`מקום ${row.rank}`} />
                    ) : (
                      <span className="font-bold text-ink3 tabular-nums">{row.rank}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <Link to={`/cadets/${row.cadet.id}`} className="flex items-center gap-2.5 hover:underline">
                      <Avatar name={row.cadet.fullName} team={row.cadet.team} />
                      <span>
                        <span className="font-bold block">{row.cadet.fullName}</span>
                        <span className="text-[11px] text-ink3">{teamLabel(row.cadet.team)}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-center font-extrabold tabular-nums">{row.score}</td>
                  <td className="py-2.5 px-3 text-center tabular-nums">{row.attendancePercent}%</td>
                  <td className="py-2.5 px-3 text-center tabular-nums" dir="ltr">
                    {row.improvementSeconds === undefined ? (
                      <span className="text-ink3">—</span>
                    ) : (
                      <span className={row.improvementSeconds >= 0 ? 'text-lvla font-bold' : 'text-lvlc font-bold'}>
                        {row.improvementSeconds > 0 ? `+${row.improvementSeconds}` : row.improvementSeconds} שנ'
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums">{row.missionsCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddScoreModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
