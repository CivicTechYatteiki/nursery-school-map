import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LinkIcon from '@mui/icons-material/Link'
import {
  Chip,
  Divider,
  getContrastRatio,
  IconButton,
  Link,
  Paper,
  Box,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { difference } from 'lodash'
import {
  getAdmissionDifficulty,
  getMinimumIndexRange,
  getIsOpened,
  NurserySchool,
  SUPPORTED_AGES,
} from '../lib/model/nursery-school'
import { LocalNurserySchoolListSet } from '../lib/model/nursery-school-list'
import { FilterProps } from '../pages'
import { blue, yellow } from '../styles/theme'
import { difficultyToStyle } from './marker'

export function NurseryDetail({
  nursery,
  inNurserySet,
  filter,
  onClose,
}: {
  nursery: NurserySchool
  inNurserySet: LocalNurserySchoolListSet
  filter: FilterProps
  onClose: () => void
}) {
  const shortAddress = nursery.address.replace(/^.{1,3}?[都道府県]/, '')
  const selectedAges = filter.ageList ?? SUPPORTED_AGES
  const otherAges = difference(SUPPORTED_AGES, selectedAges)
  const notOpened = !getIsOpened(nursery.openYear, nursery.openMonth)

  return (
    <Stack direction="column" spacing={3} sx={{ paddingTop: 0, paddingBottom: 2 }}>
      <Stack direction="column" sx={{ paddingLeft: 2, paddingRight: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ marginLeft: '-1px' /* Optical Adjustment */ }}>
            {nursery.name}
          </Typography>
          <div>
            <IconButton edge="end" onClick={() => onClose()}>
              <CloseRoundedIcon />
            </IconButton>
          </div>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Typography variant="caption" color="text.secondary">
            {shortAddress}
          </Typography>
          {/* <Typography variant="caption" color="text.secondary">
            現在地から800m
          </Typography> */}
        </Stack>
        {nursery.url && (
          <Link color="primary" underline="none" href={nursery.url} target="_blank">
            <Stack direction="row" spacing="3px">
              <LinkIcon fontSize="small" />
              <Typography variant="caption">{new URL(nursery.url).hostname}</Typography>
            </Stack>
          </Link>
        )}
      </Stack>

      <Stack spacing={2}>
        <Stack direction="column" sx={{ paddingLeft: 2, paddingRight: 2 }}>
          <Typography variant="subtitle1" component="div" sx={{ lineHeight: 1.1 }}>
            最低指数
          </Typography>
          {inNurserySet.localName === '港区' ? (
            <Typography variant="caption" color="text.secondary">
              令和3年4月入所1次利用調整のボーダーライン
            </Typography>
          ) : inNurserySet.localName === '台東区' ? (
            <Typography variant="caption" color="text.secondary">
              令和4年4月入所1次利用調整のボーダーライン
            </Typography>
          ) : inNurserySet.localName === '中央区' ? (
            <Typography variant="caption" color="text.secondary">
              令和4年4月入所1次利用調整のボーダーライン
            </Typography>
          ) : null}
        </Stack>

        {notOpened ? (
          <Box sx={{ paddingLeft: 2, paddingRight: 2 }}>
            <NewNurseryCell openYear={nursery.openYear!} openMonth={nursery.openMonth!} />
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', paddingLeft: 2, paddingRight: 2 }}>
              {selectedAges.map(age => (
                <DifficultyCell key={age} nursery={nursery} inNurserySet={inNurserySet} age={age} />
              ))}
              {otherAges.length > 0 && <Divider orientation="vertical" flexItem />}
              {otherAges.map(age => (
                <DifficultyCell key={age} nursery={nursery} inNurserySet={inNurserySet} age={age} dimmed />
              ))}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{ paddingLeft: 2, paddingRight: 2 }}
            >
              {inNurserySet.localName === '港区' ? (
                <div>
                  目安として、両親が共にフルタイムで働いていると40点になり、さらに家庭状況に応じて調整指数が加算されます。計算方法は
                  <Link
                    color="text.secondary"
                    href="https://www.city.minato.tokyo.jp/kodomo/kodomo/hoikuen/nyuen/r04-index.html"
                    target="_blank"
                  >
                    入園案内
                  </Link>
                  をご覧ください。
                </div>
              ) : inNurserySet.localName === '台東区' ? (
                <div>
                  目安として、両親が共にフルタイムで働いていると40点になり、さらに家庭状況に応じて調整指数が加算されます。計算方法は
                  <Link
                    color="text.secondary"
                    href="https://www.city.taito.lg.jp/kosodatekyouiku/kosodate/mokutei/hoiku_youjikyouiku/hoikutakuji/hoikuen/hoikuennogoannai/panflet.html"
                    target="_blank"
                  >
                    入園案内
                  </Link>
                  をご覧ください。
                </div>
              ) : inNurserySet.localName === '中央区' ? (
                <div>
                  目安として、両親が共にフルタイムで働いていると40点になり、さらに家庭状況に応じて調整指数が加算されます。計算方法は
                  <Link
                    color="text.secondary"
                    href="https://www.city.chuo.lg.jp/kosodate/hoiku/ninkahoiku/ninkahoikujo.html"
                    target="_blank"
                  >
                    入園案内
                  </Link>
                  をご覧ください。
                </div>
              ) : null}
            </Typography>
          </>
        )}
      </Stack>
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
  dimmed,
}: {
  nursery: NurserySchool
  inNurserySet: LocalNurserySchoolListSet
  age: number
  dimmed?: boolean
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
        opacity: dimmed ? 0.5 : undefined,
      }}
    >
      <Stack direction="column" spacing={1} sx={{ paddingX: 1.5, paddingTop: 1 }}>
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
          <Typography variant="body2" color="text.secondary" component="div">
            {age}歳
          </Typography>
          {inNurserySet.localName === '中央区' && age === 0 ? (
            <Typography variant="caption" color="text.secondary" component="div">
              7ヶ月
            </Typography>
          ) : null}
        </Stack>
        {indexRange.type === 'noClass' ? (
          <Typography variant="h5" component="div" sx={{ lineHeight: '32px' }}>
            ×
          </Typography>
        ) : indexRange.type === 'na' ? (
          <Typography variant="h5" component="div" sx={{ lineHeight: '32px' }}>
            {/* 全角ハイフン */}−
          </Typography>
        ) : indexRange.type === 'other' || indexRange.type === 'hasVacancy' ? (
          <Typography variant="subtitle1" component="div" sx={{ lineHeight: '32px' }}>
            {indexRange.text}
          </Typography>
        ) : (
          <Typography variant="h4" component="div" sx={{ lineHeight: '32px' }}>
            {indexRange.value}
            {indexRange.type !== 'le' && indexRange.type !== 'ge' && (
              <Typography variant="subtitle2" component="span">
                点
              </Typography>
            )}
            {indexRange.type === 'le' && (
              <Typography variant="subtitle2" component="span">
                以下
              </Typography>
            )}
            {indexRange.type === 'ge' && (
              <Typography variant="subtitle2" component="span">
                以上
              </Typography>
            )}
          </Typography>
        )}
        {indexRange.type === 'noClass' ? (
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.25 }}>
            枠なし
          </Typography>
        ) : indexRange.type === 'na' ? (
          <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.25 }}>
            空き or
            <br />
            希望者なし
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
              marginBottom: '2px',
            },
          }}
        />
      )}
    </Paper>
  )
}

function NewNurseryCell({ openYear, openMonth }: { openYear: number; openMonth: number }) {
  const theme = useTheme()

  return (
    <Paper
      variant="outlined"
      sx={{
        background: grey[50],
        maxWidth: 480,
        height: 128,
        position: 'relative',
      }}
    >
      <Stack direction="column" spacing={1} sx={{ paddingX: 2, paddingTop: 2 }}>
        <Typography variant="body2" component="div">
          令和{openYear - 2018}年{openMonth}月に開設予定です。
        </Typography>
        <Typography variant="body2" component="div">
          まだだれも入園していないため、他の園より入りやすい可能性が高いです。
        </Typography>
      </Stack>
      <EmphasizeChip
        size="small"
        label="入りやすい"
        sx={{
          border: `1px solid ${yellow[90]}`,
          color: yellow[90],
          backgroundColor: yellow[50],
          fontWeight: theme.typography.fontWeightMedium,

          position: 'absolute',
          inset: -1,
          top: 'unset',
          height: 32,

          '.MuiChip-label': {
            paddingX: 0,
            marginBottom: '2px',
          },
        }}
      />
    </Paper>
  )
}
