import { alpha, Chip, Paper, Stack, styled, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { AdmissionDifficulty, getMinimumIndexRange, NurserySchool } from '../lib/model/nursery-school'
import { blue } from '../styles/theme'
import { difficultyToStyle } from './marker'

export function NurseryDetail({ nursery, difficulty }: { nursery: NurserySchool; difficulty: AdmissionDifficulty }) {
  const difficultyStyle = difficultyToStyle(difficulty)

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
          {/* <Typography variant="caption" color="text.secondary">
            現在地から800m
          </Typography> */}
        </Stack>
      </div>

      <div>
        <Typography variant="subtitle1" component="div">
          最低指数
        </Typography>
        <Typography variant="caption" color="text.secondary">
          R3年4月入所1次利用調整
        </Typography>

        <Stack direction="row" spacing={2}>
          <Paper variant="outlined" sx={{ width: 110, background: grey[50] }}>
            <Stack direction="column" spacing={2}>
              <Stack direction="column" spacing={1}>
                <Typography variant="subtitle1" component="div">
                  0歳
                </Typography>
              </Stack>
              <Stack direction="column" spacing={1} alignItems="flex-start">
                <Typography variant="subtitle1" component="div">
                  {getMinimumIndexRange(0, nursery)}
                </Typography>
                {difficultyStyle.label && (
                  <EmphasizeChip
                    label={difficultyStyle.label}
                    sx={{ border: `1px solid ${blue[90]}`, color: blue[90], backgroundColor: difficultyStyle.color }}
                  />
                )}
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ width: 110, background: grey[50] }}>
            <Stack direction="column" spacing={2}>
              <Stack direction="column" spacing={1}>
                <Typography variant="subtitle1" component="div">
                  1歳
                </Typography>
              </Stack>
              <Stack direction="column" spacing={1} alignItems="flex-start">
                <Typography variant="subtitle1" component="div">
                  {getMinimumIndexRange(1, nursery)}
                </Typography>
                {difficultyStyle.label && (
                  <EmphasizeChip
                    label={difficultyStyle.label}
                    sx={{ border: `1px solid ${blue[90]}`, color: blue[90], backgroundColor: difficultyStyle.color }}
                  />
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </div>

      <Typography variant="caption" color="text.secondary" component="div">
        <div>{nursery.localName}の保育園全体では、最大で41・最小で22以下の指数の人が保育園に入ることができています。</div>
      </Typography>
    </Stack>
  )
}
const EmphasizeChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}))
