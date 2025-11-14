/**
 * Componente de item de chequeo WART
 * Checkbox con título, descripción y estilos consistentes
 */

interface WartCheckItemProps {
  id: string;
  titulo: string;
  descripcion: string;
  checked: boolean;
  onChange: () => void;
}

export const WartCheckItem = ({
  id,
  titulo,
  descripcion,
  checked,
  onChange,
}: WartCheckItemProps) => {
  return (
    <div className="wart-check-item">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <label htmlFor={id} className="wart-check-label">
        <p className="wart-check-title">{titulo}</p>
        <p className="wart-check-description">{descripcion}</p>
      </label>
    </div>
  );
};
