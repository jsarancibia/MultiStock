type TableEmptyStateProps = {
  colSpan: number;
  message: string;
};

export function TableEmptyState({ colSpan, message }: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-6 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
