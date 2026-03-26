import typer

app = typer.Typer()


@app.command()
def serve(
    host: str = typer.Option("0.0.0.0", help="Bind host"),
    port: int = typer.Option(8000, help="Bind port"),
    reload: bool = typer.Option(False, help="Enable auto-reload for development"),
) -> None:
    """Start the InferScale server."""
    import uvicorn

    uvicorn.run(
        "inferscale.app:create_app",
        host=host,
        port=port,
        reload=reload,
        factory=True,
    )


@app.command()
def db_upgrade() -> None:
    """Apply database migrations (alembic upgrade head)."""
    from pathlib import Path

    from alembic import command
    from alembic.config import Config

    alembic_ini = Path(__file__).parent / "db" / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini))
    command.upgrade(alembic_cfg, "head")
    typer.echo("Database migrations applied successfully.")


if __name__ == "__main__":
    app()
