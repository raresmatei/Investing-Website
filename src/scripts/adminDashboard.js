/*function AdminDashboard(){
    return(
        <div className="AdminDashboard">
            <AdminTable />
            <p>agasgd</p> 
        </div>
    )
}

const rootElement = document.getElementById("root");
console.log(rootElement);
ReactDOM.render(<AdminDashboard />, rootElement);*/
'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

const domContainer = document.getElementById('like_button_container');
ReactDOM.render(e(LikeButton), domContainer);