import { alpha, Chip, Paper, Stack, styled, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { AdmissionDifficulty, NurserySchool } from '../lib/model/nursery-school'
import { blue } from '../styles/theme'
import { difficultyToStyle } from './marker'

export function NurseryDetail({ nursery, difficulty }: { nursery: NurserySchool; difficulty: AdmissionDifficulty }) {
  const difficultyStyle = difficultyToStyle[difficulty]

  const shortAddress = nursery.address.replace(/^.{1,3}?[都道府県]/, '')

  return (
    <Stack direction="column" spacing={3} sx={{ padding: 2, paddingTop: 0 }}>
      <div>
        <Typography variant="h6" sx={{ marginLeft: '-1px' /* Optical Adjustment */ }}>
          {nursery.name}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography variant="caption" color="text.secondary">
            {shortAddress}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            現在地から800m
          </Typography>
        </Stack>
      </div>

      <Paper variant="outlined" sx={{ paddingX: 1.5, paddingY: 2, width: 176, background: grey[50] }}>
        <Stack direction="column" spacing={2}>
          <Stack direction="column" spacing={1}>
            <Typography variant="subtitle1" component="div">
              最低指数
            </Typography>
            <Typography variant="caption" color="text.secondary">
              R3年4月入所1次利用調整
            </Typography>
          </Stack>
          <Stack direction="column" spacing={1} alignItems="flex-start">
            <Typography variant="subtitle1" component="div">
              34 - 37
            </Typography>
            <EmphasizeChip
              label={difficultyStyle.label}
              sx={{ border: `1px solid ${blue[90]}`, color: blue[90], backgroundColor: difficultyStyle.color }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" component="div">
            <div>{nursery.localName}の保育園全体</div>
            <div>22以下 - 40</div>
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  )
}
const EmphasizeChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}))
