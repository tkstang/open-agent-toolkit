export interface MermaidProps {
  chart: string;
}

export function Mermaid({ chart }: MermaidProps) {
  return <pre className='mermaid'>{chart}</pre>;
}
