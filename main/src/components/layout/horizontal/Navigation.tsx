import classnames from 'classnames'

import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const Navigation = () => {

  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      {...(!isBreakpointReached && {
        className: classnames(horizontalLayoutClasses.navigation, 'relative flex border-bs')
      })}
    >
    </div>
  )
}

export default Navigation
