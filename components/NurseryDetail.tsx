import { alpha, Box, Chip, getContrastRatio, Paper, Stack, styled, Typography, useTheme } from '@mui/material'
import { grey } from '@mui/material/colors'
import {
  AdmissionDifficulty,
  getAdmissionDifficulty,
  getMinimumIndexRange,
  NurserySchool,
} from '../lib/model/nursery-school'
import { LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { blue } from '../styles/theme'
import { difficultyToStyle } from './marker'

export function NurseryDetail({
  nursery,
  inNurserySet,
}: {
  nursery: NurserySchool
  inNurserySet: LocalNurserySchoolListSet
}) {
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

        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
          {new Array(6).fill(null).map((_, i) => (
            <DifficultyCell key={i} nursery={nursery} inNurserySet={inNurserySet} age={i} />
          ))}
        </Stack>
      </div>

      <Typography variant="caption" color="text.secondary" component="div">
        <div>
          {nursery.localName}の保育園全体では、最大で41・最小で22以下の指数の人が保育園に入ることができています。
        </div>
      </Typography>
    </Stack>
  )
}
const EmphasizeChip = styled(Chip)(({ theme }) => ({
  borderRadius: 0,
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
}))

function DifficultyCell({
  nursery,
  inNurserySet,
  age,
}: {
  nursery: NurserySchool
  inNurserySet: LocalNurserySchoolListSet
  age: number
}) {
  const difficulty = getAdmissionDifficulty(nursery, inNurserySet, age)
  const difficultyStyle = difficultyToStyle(difficulty)
  const indexRange = getMinimumIndexRange(age, nursery)
  const theme = useTheme()
  const chipBgColor = difficultyStyle.color
  let chipTextColor = blue[90]
  if (getContrastRatio(chipTextColor, chipBgColor) < theme.palette.contrastThreshold) {
    chipTextColor = '#fff'
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 96,
        minWidth: 96,
        background: grey[50],
        height: 112,
        position: 'relative',
      }}
    >
      <Stack direction="column" spacing={1} sx={{ paddingX: 1.5, paddingY: 1 }}>
        <Typography variant="body2" color="text.disabled" component="div">
          {age}歳
        </Typography>
        {indexRange.type === 'na' ? (
          <Typography variant="subtitle1" component="div" sx={{ lineHeight: '32px' }}>
            {/* 全角ハイフン */}−
          </Typography>
        ) : indexRange.type === 'other' ? (
          <Typography variant="subtitle1" component="div" sx={{ lineHeight: '32px' }}>
            {indexRange.other}
          </Typography>
        ) : (
          <Typography variant="h4" component="div" sx={{ lineHeight: '32px' }}>
            {indexRange.value}
            {indexRange.type === 'le' && (
              <Typography variant="subtitle2" component="span">
                以下
              </Typography>
            )}
          </Typography>
        )}
        {indexRange.type === 'na' ? (
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.25 }}>
            空き or 枠 or 希望者なし
          </Typography>
        ) : indexRange.type === 'other' ? (
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.25 }}>
            内定者が
            <br />
            少ないなど
          </Typography>
        ) : null}
      </Stack>
      {difficultyStyle.label && (
        <EmphasizeChip
          size="small"
          label={difficultyStyle.label}
          sx={{
            border: `1px solid ${blue[90]}`,
            color: chipTextColor,
            backgroundColor: chipBgColor,
            fontWeight: theme.typography.fontWeightMedium,

            position: 'absolute',
            inset: -1,
            top: 'unset',
            height: 32,

            '.MuiChip-label': {
              paddingX: 0,
            },
          }}
        />
      )}
    </Paper>
  )
}
