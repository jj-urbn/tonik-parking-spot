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
      <div className="flex flex-1 flex-col items-center gap-4 p-8 text-center text-muted">
        <svg width="72" height="48" viewBox="0 0 72.5 49.0001" fill="none" overflow="visible" aria-hidden>
          <path d="M1.47912 7.10626C16.887 -2.94955 34.9058 11.7403 35.8629 27.8411M35.8629 27.8411C35.9368 29.0852 35.9089 30.3377 35.7701 31.5879C35.0298 38.253 26.624 38.0276 25.2679 32.039C24.0454 26.6401 31.5693 26.982 35.8629 27.8411ZM35.8629 27.8411C36.8678 28.0422 37.6958 28.2716 38.1932 28.4623C44.5112 30.8852 45.0749 42.8965 44.1498 48.5M5.40949 0.500039C5.33068 0.610671 3.90601 2.5269 1.54629 5.5835C0.57063 6.78086 0.0453024 7.26 1.01627 7.83354C1.98724 8.40709 4.47043 9.06053 7.02886 9.73377" stroke="currentColor" strokeLinecap="round"/>
        </svg>
        <p className="text-xs">Wybierz miejsce aby zobaczyć szczegóły lub je zarezerwować</p>
      </div>
    );
  }

  const editable = status === 'available' || status === 'booked-user';
  const othersBooking = status === 'booked';
  const isAvailable = status === 'available';

  const fields = [
    { label: 'Imię',    value: personName, placeholder: 'np. Robert Makłowicz', required: true,  onChange: props.onChangePersonName },
    { label: 'Blachy',  value: plates,     placeholder: 'np. PY4922H',          required: true,  onChange: props.onChangePlates },
    { label: 'Notatka', value: note,        placeholder: 'np. 9-17',             required: false, onChange: props.onChangeNote },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-8">
        {spotId && (
          <div className="flex flex-col gap-2">
            <p className="text-2xs text-muted">Miejsce</p>
            <p className="text-2xl tracking-[-0.04em] text-strong">{spotId}</p>
          </div>
        )}
        {fields.map(({ label, value, placeholder, required, onChange }) =>
          (!othersBooking || value) && (
            <InfoField
              key={label}
              label={label}
              required={!othersBooking && required}
              value={value}
              placeholder={isAvailable ? placeholder : undefined}
              readOnly={!editable}
              onChange={onChange}
            />
          )
        )}
      </div>

      {status === 'available' && (
        <div className="flex flex-col gap-4 p-8">
          <Button variant="primary" disabled={!props.canSubmit} onClick={props.onSubmit}>
            Zarezerwuj
          </Button>
          <p className="text-center text-2xs text-muted">
            Pamiętaj, że zajmujesz przestrzeń, która może być potrzebna innym kierowcom
          </p>
        </div>
      )}

      {status === 'booked-user' && (
        <div className="flex flex-col gap-2 p-8">
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
