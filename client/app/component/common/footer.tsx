import Link from 'next/link';
import styles from './footer.module.css'

interface FooterItemProps {
    icon: string;
    text: string;
    isSelected: boolean;
    url: string;
}

function FooterItem({ icon, text, isSelected, url }: FooterItemProps) {
    return (
        <Link
          className={`${styles.footerItem} ${isSelected ? styles.selected : ''}`}
          href={url}
        >
          <span className="material_symbols_outlined">{icon}</span>
          <span>{text}</span>
        </Link>
    )
}

export default function Footer({ url }: { url: string }) {
  return (
    <div className={styles.footer}>
      <FooterItem icon="dictionary" text="식물사전" isSelected={url === "식물사전"} url={"/식물사전"} />
      <FooterItem icon="home" text="홈" isSelected={url === ""} url={"/"} />
      <FooterItem icon="local_cafe" text="식물카페" isSelected={url === "community"} url={"/community"} />
    </div>
  )
}