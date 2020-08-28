import React from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';
import Logo from 'rsg-components/Logo';
import Ribbon from 'rsg-components/Ribbon';
import Styled from 'rsg-components/Styled';

const styles = ({
  color,
  fontFamily,
  fontSize,
  sidebarWidth,
  mq,
  space,
  maxWidth,
}) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: color.baseBackground,
  },
  hasSidebar: {
    paddingLeft: sidebarWidth,
    [mq.small]: {
      paddingLeft: 0,
    },
  },
  content: {
    maxWidth,
    padding: [[space[2], space[4]]],
    margin: [[0, 'auto']],
    [mq.small]: {
      padding: space[2],
    },
    display: 'block',
  },
  sidebar: {
    backgroundColor: color.sidebarBackground,
    border: [[color.border, 'solid']],
    borderWidth: [[0, 1, 0, 0]],
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: sidebarWidth,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    [mq.small]: {
      position: 'static',
      width: 'auto',
      borderWidth: [[1, 0, 0, 0]],
      paddingBottom: space[0],
    },
  },
  logo: {
    padding: space[2],
    borderBottom: [[1, color.border, 'solid']],
  },
  footer: {
    display: 'block',
    color: color.light,
    fontFamily: fontFamily.base,
    fontSize: fontSize.small,
  },
});

export function StyleGuideRenderer({
  classes,
  title,
  homepageUrl,
  children,
  toc,
  hasSidebar,
}) {
  return (
    <div className={cx(classes.root, hasSidebar && classes.hasSidebar)}>
      <main className={classes.content}>{children}</main>
      {hasSidebar && (
        <div className={classes.sidebar} data-testid="sidebar">
          <header className={classes.logo}>
            <Logo>{title}</Logo>
          </header>
          {toc}
        </div>
      )}
      <Ribbon />
    </div>
  );
}

StyleGuideRenderer.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  homepageUrl: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Styled(styles)(StyleGuideRenderer);
