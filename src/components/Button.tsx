import styles from "./button.module.css";

interface ButtonProps {
  title: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function Button({ title, onClick, icon }: ButtonProps) {
  return (
    <button className={styles.button} onClick={onClick}>
      <span>{title}</span>
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  );
}
