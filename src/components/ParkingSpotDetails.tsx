import { InfoField } from './InfoField';
import { Button } from './Button';

type DetailsStatus = 'none' | 'available' | 'booked' | 'booked-user';

type Props = {
  status: DetailsStatus;
  spotId?: string;
  personName: string;
  plates: string;
  note: string;
  canSubmit: boolean;
  onChangePersonName: (v: string) => void;
  onChangePlates: (v: string) => void;
  onChangeNote: (v: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
};

export function ParkingSpotDetails(props: Props) {
  const { status, spotId, personName, plates, note } = props;

  if (status === 'none') {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Wybierz miejsce aby zobaczyć szczegóły lub je zarezerwować
      </div>
    );
  }

  const editable = status === 'available' || status === 'booked-user';

  return (
    <div className="flex h-full flex-col p-8">
      <div className="flex-1">
        {spotId && <InfoField label="Miejsce" value={spotId} readOnly />}
        <InfoField label="Imię" required value={personName} readOnly={!editable} onChange={props.onChangePersonName} />
        <InfoField label="Blachy" required value={plates} readOnly={!editable} onChange={props.onChangePlates} />
        <InfoField label="Notatka" value={note} readOnly={!editable} onChange={props.onChangeNote} />
      </div>

      {status === 'available' && (
        <Button variant="primary" disabled={!props.canSubmit} onClick={props.onSubmit}>
          Zarezerwuj
        </Button>
      )}

      {status === 'booked-user' && (
        <div className="flex flex-col gap-3">
          <Button variant="primary" disabled={!props.canSubmit} onClick={props.onSubmit}>
            Zapisz
          </Button>
          {props.onDelete && (
            <Button variant="secondary" onClick={props.onDelete}>
              Usuń
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
