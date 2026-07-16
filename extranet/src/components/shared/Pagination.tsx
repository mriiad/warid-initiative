import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { paginationRedesignStyles } from '../../styles/paginationRedesign';

interface PaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	disabled?: boolean;
}

// Shared prev/next control for every paginated list screen, replacing each
// screen's own ad-hoc unstyled <button>/plain MUI <Button> pair.
const Pagination = ({ page, totalPages, onPageChange, disabled = false }: PaginationProps) => {
	const { t } = useTranslation();
	const { row, button, label } = paginationRedesignStyles();

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className={row}>
			<IconButton
				className={button}
				disabled={disabled || page <= 1}
				onClick={() => onPageChange(page - 1)}
				aria-label={t('common.previous')}
			>
				<ChevronLeftIcon />
			</IconButton>
			<Typography className={label}>
				{t('common.pageOf', { page, totalPages })}
			</Typography>
			<IconButton
				className={button}
				disabled={disabled || page >= totalPages}
				onClick={() => onPageChange(page + 1)}
				aria-label={t('common.next')}
			>
				<ChevronRightIcon />
			</IconButton>
		</div>
	);
};

export default Pagination;
