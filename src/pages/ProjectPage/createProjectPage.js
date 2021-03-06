import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import log from '../../helpers/log'
import track from '../../helpers/track'
import * as actionCreators from '../../actions'
import * as userContentActionCreators from '../../actions/userContent'
import { findProject } from '../../selectors/project'
import Spinner from '../../components/common/Spinner'

function loadData(props) {
  const project = props.project
  if (!project) return
  props.actions.fetchReadmeIfNeeded(project)
  props.actions.fetchProjectData(project)
  props.userContentActions.fetchProjectUserContent(project)
  track('View project', project.name)
}

class FetchProject extends Component {
  componentWillMount() {
    loadData(this.props)
  }
  render() {
    log('Render the <FetchProject> container', this.props)
    return this.props.children()
  }
}

function createProjectPage(ProjectView) {
  return class ProjectPage extends Component {
    render() {
      const { project } = this.props
      return project ? (
        <FetchProject {...this.props}>
          {() => <ProjectView {...this.props} />}
        </FetchProject>
      ) : (
        <Spinner />
      )
    }
  }
}

function mapStateToProps(state, props) {
  const {
    entities: { links, reviews },
    auth
  } = state

  // `Route` components get a `match` prop. from react-router
  const params = props.match.params
  const { id, linkId, reviewId } = params

  const project = findProject(id)(state)
  const review = reviews && reviewId ? reviews[reviewId] : null
  const link = links && linkId ? links[linkId] : null

  return {
    project,
    review,
    link,
    auth
  }
}

function mapDispatchToProps(dispatch, props) {
  const { dependencies } = props
  const { authApi } = dependencies
  return {
    actions: bindActionCreators(actionCreators, dispatch),
    authActions: {
      login: authApi.login
    },
    userContentActions: bindActionCreators(userContentActionCreators, dispatch),
    dispatch
  }
}

export default ProjectView =>
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(createProjectPage(ProjectView))
