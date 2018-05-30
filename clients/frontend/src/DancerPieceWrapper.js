import React, { Component } from 'react';
import * as Util from './util';
import DancerPiece from './DancerPiece';
import './styling/General.css';

class DancerPieceWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pieces: [],
            noPiece: false
        }
    }

    componentWillMount(){
        this.getPieces()
    }
    
    getPieces = () => {
        //TODO deal with pages :(
        Util.makeRequest("users/me/pieces?show=" + this.props.showID, {}, "GET", true)
        .then(res => {
            if (res.ok) {
              return res.json()
            }
            if (res.status === 401) {
              Util.signOut()
            }
            return res
              .text()
              .then((t) => Promise.reject(t));
        })
        .then(pieces => {
            if (pieces.length === 0) {
                this.setState({
                    noPiece: true
                })
            } else {
                this.setState({
                    pieces : pieces.pieces
                })
            }
        })
        .catch((err) => {
            console.error(err)
        })
    }

    render() {
        let allPieces = this.state.pieces
        let pieces = allPieces.map((piece, i) => {
            return (
                 <DancerPiece key={i} pieceID={piece.id} pieceName={piece.name}/>
            )
        })
        let title = "My Piece"
        if (allPieces.length > 1) {
            title = title + "s"
        }
        return (
            <section className="main">
            <div className="mainView">
                <h1>{title}</h1>
                {
                    this.state.noPiece &&
                    <p>You have not been cast in a piece yet.</p>
                }
                {pieces}
            </div>
            </section>
        );
    };
}

export default DancerPieceWrapper;